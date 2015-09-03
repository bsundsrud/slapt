import MirrorActions from '../actions/mirrorActions';
import axios from 'axios';

var MirrorSource = {
	loadMirrors() {
		return {
			remote() {
					return axios.get('/api/mirrors');
			},
			local() {
				return null;
			},
			success: MirrorActions.loadMirrors,
			error: MirrorActions.opFailed,
			loading: MirrorActions.loadingMirrors
		};
	},
	createMirror() {
		return {
			remote(mirrors, newMirror) {
				return axios.post('/api/mirrors', newMirror);
			},
			local() {
				return null;
			},
			success: MirrorActions.createMirror,
			error: MirrorActions.opFailed,
			loading: MirrorActions.creatingMirror
		};
	},
	getMirrorPackages() {
		return {
			remote(mirrors, mirrorName) {
				return axios.get('/api/mirrors/' + mirrorName + '/packages').then(function(resp) {
					return {
						mirror: mirrorName,
						packages: resp
					};
				});
			},
			local() { return null; },
			success: MirrorActions.loadMirrorPackages,
			error: MirrorActions.opFailed,
			loading: MirrorActions.loadingMirrorPackages
		};
	},
	editMirror() {
		return {
			remote(mirrors, mirrorName, updates) {
				return axios.put('/api/mirrors/' + mirrorName, updates);
			},
			local(mirrors, mirrorName, updates) {
				return null;
			},
			success: MirrorActions.editMirror,
			error: MirrorActions.opFailed,
			loading: MirrorActions.editingMirror
		};
	},
	updateMirror() {
		return {
			remote(mirrors, mirrorName) {
				return axios.post('/api/mirrors/' + mirrorName + '/update/');
			},
			local() {
				return null;
			},
			success: MirrorActions.updateJobStarted,
			error: MirrorActions.opFailed,
			loading: MirrorActions.updatingMirror
		};
	},
	dropMirror() {
		return {
			remote(mirrors, mirrorName) {
				return axios.delete('/api/mirrors/' + mirrorName).then(function(resp) {
					return mirrorName;
				});
			},
			local() {
				return null;
			},
			success: MirrorActions.dropMirror,
			error: MirrorActions.opFailed,
			loading: MirrorActions.droppingMirror
		};
	}
}

module.exports = MirrorSource;