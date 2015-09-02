var RepoActions = require('../actions/repoActions');
var RepoSource = require('../sources/repoSource');
var immutable = require('immutable');
var alt = require('../alt');

class RepoStore {
	constructor() {
		this.repos = immutable.List();
		this.repoMap = immutable.Map();
		this.errorMessage = null;
		this.bindListeners({
			handleUpdateRepos: RepoActions.UPDATE_REPOS,
			handleError: RepoActions.OP_FAILED,
			handleListRepos: RepoActions.LOADING_REPOS,
			handleAddRepo: RepoActions.ADD_REPO,
			handleDropRepo: RepoActions.DROP_REPO,
			handleUpdateRepo: RepoActions.UPDATE_REPO,
			handleLoadRepoPackages: RepoActions.LOAD_REPO_PACKAGES
		});
		this.exportAsync(RepoSource);
	}

	handleUpdateRepos(repos) {
		var newMap = {};
		repos.forEach(function(r) {
			newMap[r.Name] = r;
		});
		this.repoMap = immutable.Map(newMap);
		this.repos = immutable.List(repos);
		this.errorMessage = null;
	}

	handleError(message) {
		this.errorMessage = message;
	}

	handleListRepos() {
		this.repos = immutable.List();
		this.repoMap = immutable.Map();
	}

	handleAddRepo(repo) {
		this.repos = this.repos.push(repo);
		this.repoMap = this.repoMap.set(repo.Name, repo);
	}

	handleDropRepo(repoName) {
		this.repos = this.repos.filter((repo) => {
			if (repo.Name == repoName) {
				return false;
			}
			return true;
		});
		this.repoMap = this.repoMap.delete(repoName);
	}

	handleLoadRepoPackages(data) {
		var repo = this.repoMap.get(data.repo);
		repo.Packages = data.packages;
		this.repoMap = this.repoMap.set(repo.Name, repo);
	}

	handleUpdateRepo(repo) {
		this.repos = this.repos.map(function(r) {
			if (r.Name == repo.Name) {
				return repo;
			} else {
				return r;
			}
		});
		this.repoMap = this.repoMap.set(repo.Name, repo);
	}
}

module.exports = alt.createStore(RepoStore, 'RepoStore');