package api

import (
	"fmt"
	"log"
	"os"

	"github.com/smira/aptly/aptly"
	"github.com/smira/aptly/deb"
	"github.com/smira/aptly/utils"
)

func (a *Api) RepoCreate(name, comment, dist, component string) (*deb.LocalRepo, error) {
	repo := deb.NewLocalRepo(name, comment)
	repo.DefaultDistribution = dist
	repo.DefaultComponent = component
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.Lock()
	defer collection.Unlock()
	err := collection.Add(repo)
	if err != nil {
		return nil, err
	}
	return repo, nil
}

func (a *Api) RepoMustCreate(name, comment, dist, component string) *deb.LocalRepo {
	repo, err := a.RepoCreate(name, comment, dist, component)
	if err != nil {
		log.Printf("Error creating %s: %s", name, err)
		panic("RepoMustCreate failed")
	}
	return repo
}

func (a *Api) RepoAddFile(repoName, fileName string, removeAfter, forceReplace bool) (*aptly.RecordingResultReporter, []string, error) {
	verifier := &utils.GpgVerifier{}
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.Lock()
	defer collection.Unlock()
	repo, err := collection.ByName(repoName)
	if err != nil {
		return nil, []string{}, err
	}

	err = collection.LoadComplete(repo)
	if err != nil {
		return nil, []string{}, err
	}

	var reporter = &aptly.RecordingResultReporter{
		Warnings:     []string{},
		AddedLines:   []string{},
		RemovedLines: []string{},
	}
	var packageFiles, failedFiles []string
	packageFiles, failedFiles = deb.CollectPackageFiles([]string{fileName}, reporter)

	list, err := deb.NewPackageListFromRefList(repo.RefList(), a.Ctx().CollectionFactory().PackageCollection(), nil)
	if err != nil {
		return nil, []string{}, err
	}
	var processedFiles, failedFiles2 []string
	processedFiles, failedFiles2, err = deb.ImportPackageFiles(list, packageFiles, forceReplace, verifier, a.Ctx().PackagePool(),
		a.Ctx().CollectionFactory().PackageCollection(), reporter, nil)
	failedFiles = append(failedFiles, failedFiles2...)

	if err != nil {
		return nil, []string{}, err
	}
	repo.UpdateRefList(deb.NewPackageRefListFromPackageList(list))

	err = collection.Update(repo)
	if err != nil {
		return nil, []string{}, err
	}
	processedFiles = utils.StrSliceDeduplicate(processedFiles)
	if removeAfter {
		for _, file := range processedFiles {
			os.Remove(file)
		}
	}

	if failedFiles == nil {
		failedFiles = []string{}
	}

	return reporter, failedFiles, nil
}

func (a *Api) RepoShow(repoName string) (*deb.LocalRepo, error) {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.RLock()
	defer collection.RUnlock()
	return collection.ByName(repoName)
}

func (a *Api) RepoMustShow(repoName string) *deb.LocalRepo {
	repo, err := a.RepoShow(repoName)
	if err != nil {
		panic("RepoMustShow failed")
	}
	return repo
}

func (a *Api) RepoList() []*deb.LocalRepo {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.RLock()
	defer collection.RUnlock()
	result := []*deb.LocalRepo{}
	collection.ForEach(func(r *deb.LocalRepo) error {
		result = append(result, r)
		return nil
	})
	return result
}

func (a *Api) RepoShowPackages(repoName string) ([]string, error) {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	repo, err := collection.ByName(repoName)
	if err != nil {
		return []string{}, err
	}
	err = collection.LoadComplete(repo)
	if err != nil {
		return []string{}, err
	}

	list, err := deb.NewPackageListFromRefList(repo.RefList(), a.Ctx().CollectionFactory().PackageCollection(), nil)
	if err != nil {
		return []string{}, err
	}
	return list.Strings(), nil
}

func (a *Api) RepoMustShowPackages(repoName string) []string {
	results, err := a.RepoShowPackages(repoName)
	if err != nil {
		panic("RepoMustShowPackages failed")
	}
	return results
}

func (a *Api) RepoShowPackagesDetail(repoName string) ([]*deb.Package, error) {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	repo, err := collection.ByName(repoName)
	if err != nil {
		return nil, err
	}
	err = collection.LoadComplete(repo)
	if err != nil {
		return nil, err
	}

	list, err := deb.NewPackageListFromRefList(repo.RefList(), a.Ctx().CollectionFactory().PackageCollection(), nil)
	if err != nil {
		return nil, err
	}
	result := []*deb.Package{}
	list.ForEach(func(p *deb.Package) error {
		result = append(result, p)
		return nil
	})
	return result, nil
}

func (a *Api) RepoMustShowPackagesDetail(repoName string) []*deb.Package {
	results, err := a.RepoShowPackagesDetail(repoName)
	if err != nil {
		panic("RepoMustShowPackagesDetail failed")
	}
	return results
}

func (a *Api) RepoDelete(repoName string, force bool) error {
	repo, err := a.Ctx().CollectionFactory().LocalRepoCollection().ByName(repoName)
	if err != nil {
		return err
	}
	published := a.Ctx().CollectionFactory().PublishedRepoCollection().ByLocalRepo(repo)
	if len(published) > 0 {
		return fmt.Errorf("unable to drop, local repo is published")
	}

	if !force {
		snapshots := a.Ctx().CollectionFactory().SnapshotCollection().ByLocalRepoSource(repo)
		if len(snapshots) > 0 {
			return fmt.Errorf("unable to drop, local repo has snapshots")
		}
	}
	return a.Ctx().CollectionFactory().LocalRepoCollection().Drop(repo)
}

func (a *Api) RepoDeletePackage(repoName, packageRef string) error {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.Lock()
	defer collection.Unlock()
	repo, err := collection.ByName(repoName)
	if err != nil {
		return err
	}

	err = collection.LoadComplete(repo)
	if err != nil {
		return err
	}

	list, err := deb.NewPackageListFromRefList(repo.RefList(), a.Ctx().CollectionFactory().PackageCollection(), nil)
	if err != nil {
		return err
	}

	pkg, err := a.Ctx().CollectionFactory().PackageCollection().ByKey([]byte(packageRef))
	if err != nil {
		return err
	}

	list.Remove(pkg)

	repo.UpdateRefList(deb.NewPackageRefListFromPackageList(list))
	return collection.Update(repo)
}

func (a *Api) RepoEdit(repoName string, cb func(*deb.LocalRepo)) (*deb.LocalRepo, error) {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	repo, err := collection.ByName(repoName)
	if err != nil {
		return nil, err
	}

	cb(repo)

	err = collection.Update(repo)
	if err != nil {
		return nil, err
	}
	return repo, nil
}

func (a *Api) RepoMustEdit(repoName string, cb func(*deb.LocalRepo)) *deb.LocalRepo {
	repo, err := a.RepoEdit(repoName, cb)
	if err != nil {
		panic("RepoMustEdit failed")
	}
	return repo
}
