package api

import (
	"fmt"

	"github.com/smira/aptly/database"
	"github.com/smira/aptly/deb"
)

func (a *Api) SnapshotList(sortMethod string) (result []*deb.Snapshot) {
	collection := a.Ctx().CollectionFactory().SnapshotCollection()
	collection.RLock()
	defer collection.RUnlock()

	if sortMethod == "" {
		sortMethod = "name"
	}

	collection.ForEachSorted(sortMethod, func(s *deb.Snapshot) error {
		result = append(result, s)
		return nil
	})

	return result
}

func (a *Api) SnapshotCreateFromMirror(mirrorName, snapshotName, description string) (*deb.Snapshot, error) {
	collection := a.Ctx().CollectionFactory().RemoteRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.Lock()
	defer snapshotCollection.Unlock()

	repo, err := collection.ByName(mirrorName)
	if err != nil {
		return nil, err
	}

	err = repo.CheckLock()
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(repo)
	if err != nil {
		return nil, err
	}

	snapshot, err := deb.NewSnapshotFromRepository(snapshotName, repo)
	if err != nil {
		return nil, err
	}

	snapshot.Description = description

	snapshotCollection.Add(snapshot)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}

func (a *Api) SnapshotCreate(snapshotName, description string, sourceSnapshots []string, packageRefs []string) (*deb.Snapshot, error) {
	var err error
	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.Lock()
	defer snapshotCollection.Unlock()
	sources := make([]*deb.Snapshot, len(sourceSnapshots))

	for i := range sourceSnapshots {
		sources[i], err = snapshotCollection.ByName(sourceSnapshots[i])
		if err != nil {
			return nil, err
		}

		err = snapshotCollection.LoadComplete(sources[i])
		if err != nil {
			return nil, err
		}
	}
	list := deb.NewPackageList()

	// verify package refs and build package list
	for _, ref := range packageRefs {
		var p *deb.Package

		p, err = a.Ctx().CollectionFactory().PackageCollection().ByKey([]byte(ref))
		if err != nil {
			if err == database.ErrNotFound {
				return nil, fmt.Errorf("package %s: %s", ref, err)
			} else {
				return nil, err
			}
		}
		err = list.Add(p)
		if err != nil {
			return nil, err
		}
	}
	snapshot := deb.NewSnapshotFromRefList(snapshotName, sources, deb.NewPackageRefListFromPackageList(list), description)

	err = snapshotCollection.Add(snapshot)
	if err != nil {
		return nil, err
	}
	return snapshot, nil
}

func (a *Api) SnapshotCreateFromRepo(repoName, snapshotName, description string) (*deb.Snapshot, error) {
	collection := a.Ctx().CollectionFactory().LocalRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.Lock()
	defer snapshotCollection.Unlock()

	repo, err := collection.ByName(repoName)
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(repo)
	if err != nil {
		return nil, err
	}

	snapshot, err := deb.NewSnapshotFromLocalRepo(snapshotName, repo)
	if err != nil {
		return nil, err
	}

	snapshot.Description = description

	err = snapshotCollection.Add(snapshot)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}

func (a *Api) SnapshotUpdateDescription(snapshotName, description string) (*deb.Snapshot, error) {
	collection := a.Ctx().CollectionFactory().SnapshotCollection()
	collection.Lock()
	defer collection.Unlock()

	snapshot, err := collection.ByName(snapshotName)
	if err != nil {
		return nil, err
	}
	snapshot.Description = description

	err = collection.Update(snapshot)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}

func (a *Api) SnapshotShow(snapshotName string) (*deb.Snapshot, error) {
	collection := a.Ctx().CollectionFactory().SnapshotCollection()
	collection.RLock()
	defer collection.RUnlock()

	snapshot, err := collection.ByName(snapshotName)
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(snapshot)
	if err != nil {
		return nil, err
	}

	return snapshot, nil
}

func (a *Api) SnapshotDrop(snapshotName string, force bool) error {
	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.Lock()
	defer snapshotCollection.Unlock()

	publishedCollection := a.Ctx().CollectionFactory().PublishedRepoCollection()
	publishedCollection.RLock()
	defer publishedCollection.RUnlock()

	snapshot, err := snapshotCollection.ByName(snapshotName)
	if err != nil {
		return err
	}

	published := publishedCollection.BySnapshot(snapshot)

	if len(published) > 0 {
		return fmt.Errorf("unable to drop: snapshot is published")
	}

	if !force {
		snapshots := snapshotCollection.BySnapshotSource(snapshot)
		if len(snapshots) > 0 {
			return fmt.Errorf("won't delete snapshot that was used as source for other snapshots, use ?force=1 to override")
		}
	}

	err = snapshotCollection.Drop(snapshot)
	if err != nil {
		return err
	}
	return nil
}

func (a *Api) SnapshotDiff(leftSnapshot, rightSnapshot string, onlyMatching bool) ([]deb.PackageDiff, error) {
	collection := a.Ctx().CollectionFactory().SnapshotCollection()
	collection.RLock()
	defer collection.RUnlock()

	snapshotA, err := collection.ByName(leftSnapshot)
	if err != nil {
		return nil, err
	}

	snapshotB, err := collection.ByName(rightSnapshot)
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(snapshotA)
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(snapshotB)
	if err != nil {
		return nil, err
	}

	// Calculate diff
	diff, err := snapshotA.RefList().Diff(snapshotB.RefList(), a.Ctx().CollectionFactory().PackageCollection())
	if err != nil {
		return nil, err
	}

	result := []deb.PackageDiff{}

	for _, pdiff := range diff {
		if onlyMatching && (pdiff.Left == nil || pdiff.Right == nil) {
			continue
		}

		result = append(result, pdiff)
	}

	return result, nil
}

func (a *Api) SnapshotShowPackages(snapshotName string) ([]string, error) {
	collection := a.Ctx().CollectionFactory().SnapshotCollection()
	collection.RLock()
	defer collection.RUnlock()

	snapshot, err := collection.ByName(snapshotName)
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(snapshot)
	if err != nil {
		return nil, err
	}
	list, err := deb.NewPackageListFromRefList(snapshot.RefList(), a.Ctx().CollectionFactory().PackageCollection(), nil)
	if err != nil {
		return nil, err
	}
	return list.Strings(), nil
}

func (a *Api) SnapshotShowPackagesDetail(snapshotName string) ([]*deb.Package, error) {
	collection := a.Ctx().CollectionFactory().SnapshotCollection()
	collection.RLock()
	defer collection.RUnlock()

	snapshot, err := collection.ByName(snapshotName)
	if err != nil {
		return nil, err
	}

	err = collection.LoadComplete(snapshot)
	if err != nil {
		return nil, err
	}
	list, err := deb.NewPackageListFromRefList(snapshot.RefList(), a.Ctx().CollectionFactory().PackageCollection(), nil)
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
