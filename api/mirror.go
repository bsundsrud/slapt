package api

import (
	"fmt"
	"strings"

	"github.com/smira/aptly/query"

	"github.com/smira/aptly/deb"
)

func (a *Api) MirrorList() []*deb.RemoteRepo {
	collection := a.Ctx().CollectionFactory().RemoteRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	repos := make([]*deb.RemoteRepo, 0, collection.Len())
	collection.ForEach(func(repo *deb.RemoteRepo) error {
		repos = append(repos, repo)
		return nil
	})
	return repos
}

func (a *Api) MirrorCreatePPA(name, ppaUrl, filter string, withSources, withUdebs, filterWithDeps, forceComponents bool) (*deb.RemoteRepo, error) {
	var archiveUrl, distribution string
	var components []string

	archiveUrl, distribution, components, err := deb.ParsePPA(ppaUrl, a.Ctx().Config())
	if err != nil {
		return nil, err
	}
	return a.MirrorCreate(name, archiveUrl, filter, distribution, components, withSources, withUdebs, filterWithDeps, forceComponents)
}

func (a *Api) MirrorCreate(name, url, filter, distribution string, components []string, withSources, withUdebs, filterWithDeps, forceComponents bool) (*deb.RemoteRepo, error) {
	repo, err := deb.NewRemoteRepo(name, url, distribution, components, a.Ctx().ArchitecturesList(), withSources, withUdebs)
	if err != nil {
		return nil, fmt.Errorf("unable to create mirror: %s", err)
	}

	repo.Filter = filter
	repo.FilterWithDeps = filterWithDeps
	repo.SkipComponentCheck = forceComponents

	if repo.Filter != "" {
		_, err := query.Parse(repo.Filter)
		if err != nil {
			return nil, fmt.Errorf("unable to create mirror: %s", err)
		}
	}

	_, err = getVerifier(false)
	if err != nil {
		return nil, fmt.Errorf("unable to init GPG: %s", err)
	}

	err = repo.Fetch(a.Ctx().Downloader(), nil)
	if err != nil {
		return nil, fmt.Errorf("unable to fetch mirror: %s", err)
	}

	err = a.Ctx().CollectionFactory().RemoteRepoCollection().Add(repo)
	if err != nil {
		return nil, fmt.Errorf("unable to add mirror: %s", err)
	}

	return repo, nil
}

func (a *Api) MirrorDrop(name string, force bool) error {
	collection := a.Ctx().CollectionFactory().RemoteRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.RLock()
	defer snapshotCollection.RUnlock()

	repo, err := collection.ByName(name)
	if err != nil {
		return fmt.Errorf("unable to drop: %s", err)
	}

	err = repo.CheckLock()
	if err != nil {
		return fmt.Errorf("unable to drop: %s", err)
	}

	if !force {
		snapshots := snapshotCollection.ByRemoteRepoSource(repo)

		if len(snapshots) > 0 {
			return fmt.Errorf("mirror has snapshots")
		}
	}

	err = collection.Drop(repo)
	if err != nil {
		return fmt.Errorf("unable to drop: %s", err)
	}

	return nil
}

func (a *Api) MirrorEdit(name string, visitor func(*deb.RemoteRepo) error) (*deb.RemoteRepo, error) {
	collection := a.Ctx().CollectionFactory().RemoteRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	repo, err := collection.ByName(name)
	if err != nil {
		return nil, fmt.Errorf("unable to edit: %s", err)
	}

	err = repo.CheckLock()
	if err != nil {
		return nil, fmt.Errorf("unable to edit: %s", err)
	}

	err = visitor(repo)
	if err != nil {
		return nil, fmt.Errorf("unable to edit: %s", err)
	}

	if repo.IsFlat() && repo.DownloadUdebs {
		return nil, fmt.Errorf("unable to edit: flat mirrors don't support udebs")
	}

	if repo.Filter != "" {
		_, err = query.Parse(repo.Filter)
		if err != nil {
			return nil, fmt.Errorf("unable to edit: %s", err)
		}
	}

	if repo.Architectures != nil {
		err = repo.Fetch(a.Ctx().Downloader(), nil)
		if err != nil {
			return nil, fmt.Errorf("unable to edit: %s", err)
		}
	}

	err = collection.Update(repo)
	if err != nil {
		return nil, fmt.Errorf("unable to edit: %s", err)
	}

	return repo, nil
}

func (a *Api) MirrorShow(name string) (*deb.RemoteRepo, error) {
	collection := a.Ctx().CollectionFactory().RemoteRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	repo, err := collection.ByName(name)
	if err != nil {
		return nil, fmt.Errorf("unable to show: %s", err)
	}

	err = collection.LoadComplete(repo)
	if err != nil {
		return nil, fmt.Errorf("unable to show: %s", err)
	}

	return repo, nil
}

func (a *Api) MirrorShowPackages(name string) ([]*deb.Package, error) {
	repo, err := a.MirrorShow(name)
	if err != nil {
		return nil, err
	}
	if repo.RefList() == nil {
		return []*deb.Package{}, nil
	}

	packages := make([]*deb.Package, 0, repo.RefList().Len())
	pkgCollection := a.Ctx().CollectionFactory().PackageCollection()
	err = repo.RefList().ForEach(func(key []byte) error {
		p, err2 := pkgCollection.ByKey(key)
		if err2 != nil {
			return err2
		}
		packages = append(packages, p)
		return nil
	})
	if err != nil {
		return nil, err
	}
	return packages, nil
}

func (a *Api) MirrorUpdate(name string, force, ignoreChecksums bool) error {
	var err error

	repo, err := a.MirrorShow(name)

	if !force {
		err = repo.CheckLock()
		if err != nil {
			return fmt.Errorf("unable to update: %s", err)
		}
	}

	verifier, err := getVerifier(false)
	if err != nil {
		return fmt.Errorf("unable to initialize GPG verifier: %s", err)
	}

	err = repo.Fetch(a.Ctx().Downloader(), verifier)
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}

	err = repo.DownloadPackageIndexes(a.Ctx().Progress(), a.Ctx().Downloader(), a.Ctx().CollectionFactory(), ignoreChecksums)
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}

	if repo.Filter != "" {
		var filterQuery deb.PackageQuery

		filterQuery, err = query.Parse(repo.Filter)
		if err != nil {
			return fmt.Errorf("unable to update: %s", err)
		}

		_, _, err = repo.ApplyFilter(a.Ctx().DependencyOptions(), filterQuery)
		if err != nil {
			return fmt.Errorf("unable to update: %s", err)
		}
	}

	var queue []deb.PackageDownloadTask

	queue, _, err = repo.BuildDownloadQueue(a.Ctx().PackagePool())
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}

	defer func() {
		// on any interruption, unlock the mirror
		err := a.Ctx().ReOpenDatabase()
		if err == nil {
			repo.MarkAsIdle()
			a.Ctx().CollectionFactory().RemoteRepoCollection().Update(repo)
		}
	}()

	repo.MarkAsUpdating()

	collection := a.Ctx().CollectionFactory().RemoteRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	collection.Update(repo)
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}

	err = a.Ctx().CloseDatabase()
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}

	count := len(queue)
	ch := make(chan error, count)

	go func() {
		for _, task := range queue {
			a.Ctx().Downloader().DownloadWithChecksum(repo.PackageURL(task.RepoURI).String(), task.DestinationPath, ch, task.Checksums, ignoreChecksums)
		}

		// We don't need queue after this point
		queue = nil
	}()

	errors := make([]string, 0)

	for count > 0 {
		select {
		case err = <-ch:
			if err != nil {
				errors = append(errors, err.Error())
			}
			count--
		}
	}

	if len(errors) > 0 {
		return fmt.Errorf("unable to update: download errors:\n  %s\n", strings.Join(errors, "\n  "))
	}

	err = a.Ctx().ReOpenDatabase()
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}
	repo.FinalizeDownload()
	collection.Update(repo)
	if err != nil {
		return fmt.Errorf("unable to update: %s", err)
	}
	return nil
}
