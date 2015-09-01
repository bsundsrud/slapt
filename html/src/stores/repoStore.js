var RepoActions = require('../actions/repoActions');
var RepoSource = require('../sources/repoSource');
var immutable = require('immutable');
var alt = require('../alt');

class RepoStore {
	constructor() {
		this.repos = immutable.List();
		this.errorMessage = null;
		this.bindListeners({
			handleUpdateRepos: RepoActions.UPDATE_REPOS,
			handleError: RepoActions.OP_FAILED,
			handleListRepos: RepoActions.LOADING_REPOS,
			handleAddRepo: RepoActions.ADD_REPO,
			handleDropRepo: RepoActions.DROP_REPO
		});
		this.exportAsync(RepoSource);
	}

	handleUpdateRepos(repos) {
		this.repos = immutable.List(repos);
		this.errorMessage = null;
	}

	handleError(message) {
		this.errorMessage = message;
	}

	handleListRepos() {
		this.repos = immutable.List();
	}

	handleAddRepo(repo) {
		this.repos = this.repos.push(repo);
	}

	handleDropRepo(repoName) {
		this.repos = this.repos.filter((repo) => {
			if (repo.Name == repoName) {
				return false;
			}
			return true;
		});
	}
}

module.exports = alt.createStore(RepoStore, 'RepoStore');