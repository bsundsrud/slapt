var alt = require('../alt');

class RepoActions {
	creatingRepo() {
		this.dispatch();
	}

	addRepo(repo) {
		this.dispatch(repo);
	}

	updateRepos(repos) {
		this.dispatch(repos);
	}

	opFailed(errorMessage) {
		this.dispatch(errorMessage);
	}

	loadingRepos() {
		this.dispatch();
	}

	droppingRepo() {
		this.dispatch();
	}

	dropRepo(repoName) {
		this.dispatch(repoName);
	}

	updateRepo(repo) {
		this.dispatch(repo);
	}

	updatingRepo() {
		this.dispatch();
	}

	loadRepoPackages(data) {
		this.dispatch(data);
	}

	loadingRepoPackages() {
		this.dispatch();
	}
}

module.exports = alt.createActions(RepoActions);