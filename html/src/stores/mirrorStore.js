var MirrorActions = require('../actions/mirrorActions');
var MirrorSource = require('../sources/mirrorSource');
var immutable = require('immutable');
var alt = require('../alt');

class MirrorStore {
	constructor() {
		this.mirrorMap = immutable.Map();
		this.errorMessage = null;

		this.bindListeners({
			handleLoadMirrors: MirrorActions.LOAD_MIRRORS,
			handleError: MirrorActions.OP_FAILED,
			handleLoadingMirrors: MirrorActions.LOADING_MIRRORS,
			handleCreateMirror: MirrorActions.CREATE_MIRROR,
			handleDropMirror: MirrorActions.DROP_MIRROR,
			handleEditMirror: MirrorActions.EDIT_MIRROR,
			handleLoadMirrorPackages: MirrorActions.LOAD_MIRROR_PACKAGES,
			handleUpdateJobStarted: MirrorActions.UPDATE_JOB_STARTED
		});
		this.exportAsync(MirrorSource);
	}

	handleLoadMirrors(mirrors) {
		var newMap = {};
		mirrors.forEach(function(r) {
			newMap[r.Name] = r;
		});
		this.mirrorMap = immutable.Map(newMap);
		this.errorMessage = null;
	}

	handleError(message) {
		this.errorMessage = message;
	}

	handleLoadingMirrors() {
		this.mirrorMap = immutable.Map();
	}

	handleCreateMirror(mirror) {
		this.mirrorMap = this.mirrorMap.set(mirror.Name, mirror);
	}

	handleDropMirror(mirrorName) {
		this.mirrorMap = this.mirrorMap.remove(mirrorName);
	}

	handleLoadMirrorPackages(data) {
		var mirror = this.mirrorMap.get(data.mirror);
		mirror.Packages = data.packages;
		this.mirrorMap = this.mirrorMap.set(mirror.Name, mirror);
	}

	handleEditMirror(mirror) {
		this.mirrorMap = this.mirrorMap.set(mirror.Name, mirror);
	}

	handleUpdateJobStarted(job) {

	}
}

module.exports = alt.createStore(MirrorStore, 'MirrorStore');