package api

import (
	"fmt"
	"strings"

	"github.com/smira/aptly/deb"
	"github.com/smira/aptly/utils"
)

// Replace '_' with '/' and double '__' with single '_'
func parseEscapedPath(path string) string {
	result := strings.Replace(strings.Replace(path, "_", "/", -1), "//", "_", -1)
	if result == "" {
		result = "."
	}
	return result
}

type PublishSource struct {
	Component string
	Name      string `binding:"required"`
}

func (a *Api) PublishList() ([]*deb.PublishedRepo, error) {
	localCollection := a.Ctx().CollectionFactory().LocalRepoCollection()
	localCollection.RLock()
	defer localCollection.RUnlock()

	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.RLock()
	defer snapshotCollection.RUnlock()

	collection := a.Ctx().CollectionFactory().PublishedRepoCollection()
	collection.RLock()
	defer collection.RUnlock()

	result := make([]*deb.PublishedRepo, 0, collection.Len())

	err := collection.ForEach(func(repo *deb.PublishedRepo) error {
		err := collection.LoadComplete(repo, a.Ctx().CollectionFactory())
		if err != nil {
			return err
		}

		result = append(result, repo)

		return nil
	})

	if err != nil {
		return nil, err
	}

	return result, nil

}

func (a *Api) PublishRepoOrSnapshot(prefix, distribution, label, origin string, sourceKind string, sources []PublishSource,
	forceOverwrite bool, architectures []string, signingOptions SigningOptions) (*deb.PublishedRepo, error) {

	param := parseEscapedPath(prefix)
	storage, prefix := deb.ParsePrefix(param)
	signer, err := getSigner(&signingOptions)
	if err != nil {
		return nil, err
	}

	if len(sources) == 0 {
		return nil, fmt.Errorf("Must specify at least one source")
	}

	var components []string
	var debSources []interface{}

	if sourceKind == "snapshot" {
		var snapshot *deb.Snapshot

		snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
		snapshotCollection.RLock()
		defer snapshotCollection.RUnlock()

		for _, source := range sources {
			components = append(components, source.Component)

			snapshot, err = snapshotCollection.ByName(source.Name)
			if err != nil {
				return nil, fmt.Errorf("unable to publish: %s", err)
			}

			err = snapshotCollection.LoadComplete(snapshot)
			if err != nil {
				return nil, fmt.Errorf("unable to publish: %s", err)
			}

			debSources = append(debSources, snapshot)
		}
	} else if sourceKind == "local" {
		var localRepo *deb.LocalRepo

		localCollection := a.Ctx().CollectionFactory().LocalRepoCollection()
		localCollection.RLock()
		defer localCollection.RUnlock()

		for _, source := range sources {
			components = append(components, source.Component)

			localRepo, err = localCollection.ByName(source.Name)
			if err != nil {
				return nil, fmt.Errorf("unable to publish: %s", err)
			}

			err = localCollection.LoadComplete(localRepo)
			if err != nil {
				return nil, fmt.Errorf("unable to publish: %s", err)
			}

			debSources = append(debSources, localRepo)
		}
	} else {
		return nil, fmt.Errorf("unknown SourceKind")
	}

	collection := a.Ctx().CollectionFactory().PublishedRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	published, err := deb.NewPublishedRepo(storage, prefix, distribution, architectures, components, debSources, a.Ctx().CollectionFactory())
	if err != nil {
		return nil, fmt.Errorf("unable to publish: %s", err)
	}
	published.Origin = origin
	published.Label = label

	duplicate := collection.CheckDuplicate(published)
	if duplicate != nil {
		a.Ctx().CollectionFactory().PublishedRepoCollection().LoadComplete(duplicate, a.Ctx().CollectionFactory())
		return nil, fmt.Errorf("prefix/distribution already used by another published repo: %s", duplicate)
	}

	err = published.Publish(a.Ctx().PackagePool(), a.Ctx(), a.Ctx().CollectionFactory(), signer, nil, forceOverwrite)
	if err != nil {
		return nil, fmt.Errorf("unable to publish: %s", err)
	}

	err = collection.Add(published)
	if err != nil {
		return nil, fmt.Errorf("unable to save to DB: %s", err)
	}

	return published, nil
}

func (a *Api) PublishRepo(prefix, distribution, label, origin string, sources []PublishSource,
	forceOverwrite bool, architectures []string, signingOptions SigningOptions) (*deb.PublishedRepo, error) {

	return a.PublishRepoOrSnapshot(prefix, distribution, label, origin, "local", sources, forceOverwrite, architectures, signingOptions)
}

func (a *Api) PublishSnapshot(prefix, distribution, label, origin string, sources []PublishSource,
	forceOverwrite bool, architectures []string, signingOptions SigningOptions) (*deb.PublishedRepo, error) {

	return a.PublishRepoOrSnapshot(prefix, distribution, label, origin, "snapshot", sources, forceOverwrite, architectures, signingOptions)
}

func (a *Api) PublishSwitch(prefix, distribution string, snapshots []PublishSource,
	forceOverwrite bool, signingOptions SigningOptions) (*deb.PublishedRepo, error) {

	param := parseEscapedPath(prefix)
	storage, prefix := deb.ParsePrefix(param)
	signer, err := getSigner(&signingOptions)
	if err != nil {
		return nil, fmt.Errorf("unable to initialize GPG signer: %s", err)
	}

	// published.LoadComplete would touch local repo collection
	localRepoCollection := a.Ctx().CollectionFactory().LocalRepoCollection()
	localRepoCollection.RLock()
	defer localRepoCollection.RUnlock()

	snapshotCollection := a.Ctx().CollectionFactory().SnapshotCollection()
	snapshotCollection.RLock()
	defer snapshotCollection.RUnlock()

	collection := a.Ctx().CollectionFactory().PublishedRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	published, err := collection.ByStoragePrefixDistribution(storage, prefix, distribution)
	if err != nil {
		return nil, fmt.Errorf("unable to update: %s", err)
	}
	err = collection.LoadComplete(published, a.Ctx().CollectionFactory())
	if err != nil {
		return nil, fmt.Errorf("unable to update: %s", err)
	}

	var updatedComponents []string

	if published.SourceKind == "local" {
		if len(snapshots) > 0 {
			return nil, fmt.Errorf("snapshots shouldn't be given when updating local repo")
		}
		updatedComponents = published.Components()
		for _, component := range updatedComponents {
			published.UpdateLocalRepo(component)
		}
	} else if published.SourceKind == "snapshot" {
		publishedComponents := published.Components()
		for _, snapshotInfo := range snapshots {
			if !utils.StrSliceHasItem(publishedComponents, snapshotInfo.Component) {
				return nil, fmt.Errorf("component %s is not in published repository", snapshotInfo.Component)
			}

			snapshot, err := snapshotCollection.ByName(snapshotInfo.Name)
			if err != nil {
				return nil, err
			}

			err = snapshotCollection.LoadComplete(snapshot)
			if err != nil {
				return nil, err
			}

			published.UpdateSnapshot(snapshotInfo.Component, snapshot)
			updatedComponents = append(updatedComponents, snapshotInfo.Component)
		}
	} else {
		return nil, fmt.Errorf("unknown published repository type")
	}

	err = published.Publish(a.Ctx().PackagePool(), a.Ctx(), a.Ctx().CollectionFactory(), signer, nil, forceOverwrite)
	if err != nil {
		return nil, fmt.Errorf("unable to update: %s", err)
	}

	err = collection.Update(published)
	if err != nil {
		return nil, fmt.Errorf("unable to save to DB: %s", err)
	}

	err = collection.CleanupPrefixComponentFiles(published.Prefix, updatedComponents,
		a.Ctx().GetPublishedStorage(storage), a.Ctx().CollectionFactory(), nil)
	if err != nil {
		return nil, fmt.Errorf("unable to update: %s", err)
	}

	return published, nil
}

func (a *Api) PublishDrop(prefix, distribution string, force bool) error {
	param := parseEscapedPath(prefix)
	storage, prefix := deb.ParsePrefix(param)

	// published.LoadComplete would touch local repo collection
	localRepoCollection := a.Ctx().CollectionFactory().LocalRepoCollection()
	localRepoCollection.RLock()
	defer localRepoCollection.RUnlock()

	collection := a.Ctx().CollectionFactory().PublishedRepoCollection()
	collection.Lock()
	defer collection.Unlock()

	err := collection.Remove(a.Ctx(), storage, prefix, distribution,
		a.Ctx().CollectionFactory(), a.Ctx().Progress(), force)
	if err != nil {
		return fmt.Errorf("unable to drop: %s", err)
	}
	return nil
}
