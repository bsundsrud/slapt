var alt = require('../alt');

class MirrorActions {
	opFailed(errorMessage) {
		this.dispatch(errorMessage);
	}

	creatingMirror() {
		this.dispatch();
	}

	createMirror(mirror) {
		this.dispatch(mirror);
	}

	loadMirrors(mirrors) {
		this.dispatch(mirrors);
	}

	loadingMirrors() {
		this.dispatch();
	}

	droppingMirror() {
		this.dispatch();
	}

	dropMirror(mirrorName) {
		this.dispatch(mirrorName);
	}

	editMirror(mirror) {
		this.dispatch(mirror);
	}

	editingMirror() {
		this.dispatch();
	}

	updateJobStarted(job) {
		this.dispatch(job);
	}

	updatingMirror() {
		this.dispatch();
	}

	loadMirrorPackages(data) {
		this.dispatch(data);
	}

	loadingMirrorPackages() {
		this.dispatch();
	}
}

module.exports = alt.createActions(MirrorActions);