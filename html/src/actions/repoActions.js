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
}

module.exports = alt.createActions(RepoActions);