import RepoActions from '../actions/repoActions';
import axios from 'axios';

var RepoSource = {
	listRepos() {
		return {
			remote() {
					return axios.get('/api/repos');
			},
			local() {
				return null;
			},
			success: RepoActions.updateRepos,
			error: RepoActions.opFailed,
			loading: RepoActions.loadingRepos
		};
	},
	createRepo() {
		return {
			remote(repos, newRepo) {
				return axios.post('/api/repos', newRepo);
			},
			local() {
				return null;
			},
			success: RepoActions.addRepo,
			error: RepoActions.opFailed,
			loading: RepoActions.creatingRepo
		};
	},
	getRepoPackages() {
		return {
			remote(repos, repoName) {
				return axios.get('/api/repos/' + repoName + '/packages').then(function(resp) {
					return {
						repo: repoName,
						packages: resp
					};
				});
			},
			local() { return null; },
			success: RepoActions.loadRepoPackages,
			error: RepoActions.opFailed,
			loading: RepoActions.loadingRepoPackages
		};
	},
	updateRepo() {
		return {
			remote(repos, repoName, updates) {
				return axios.put('/api/repos/' + repoName, updates);
			},
			local(repos, repoName, updates) {
				return null;
			},
			success: RepoActions.updateRepo,
			error: RepoActions.opFailed,
			loading: RepoActions.updatingRepo
		};
	},
	dropRepo() {
		return {
			remote(repos, repoName) {
				return axios.delete('/api/repos/' + repoName).then(function(resp) {
					return repoName;
				});
			},
			local() {
				return null;
			},
			success: RepoActions.dropRepo,
			error: RepoActions.opFailed,
			loading: RepoActions.droppingRepo
		};
	}
}

module.exports = RepoSource;