import RepoActions from '../actions/repoActions';
import axios from 'axios';

axios.interceptors.response.use(function(resp) { return resp; },
	function(resp) {
		return Promise.reject({
			errors: resp.data,
			status: resp.status,
			statusText: resp.statusText
		});
	})

var RepoSource = {
	listRepos() {
		return {
			remote() {
					return axios.get('/api/repos')
						.then(function (resp) {
							return resp.data;
						});
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
				return axios.post('/api/repos', newRepo)
						.then(function (resp) {
							return resp.data;
						});
			},
			local() {
				return null;
			},
			success: RepoActions.addRepo,
			error: RepoActions.opFailed,
			loading: RepoActions.creatingRepo
		};
	},
	dropRepo() {
		return {
			remote(repos, repoName) {
				return axios.delete('/api/repos/' + repoName)
						.then(function (resp) {
							return resp.data;
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