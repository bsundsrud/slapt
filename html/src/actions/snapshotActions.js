var alt = require('../alt');

class SnapshotActions {
	creatingSnapshot() {
		this.dispatch();
	}

	createSnapshot(snapshot) {
		this.dispatch(snapshot);
	}

	loadSnapshots(snapshots) {
		this.dispatch(snapshots);
	}

	opFailed(errorMessage) {
		this.dispatch(errorMessage);
	}

	loadingSnapshots() {
		this.dispatch();
	}

	droppingSnapshot() {
		this.dispatch();
	}

	dropSnapshot(snapshotName) {
		this.dispatch(snapshotName);
	}

	updateSnapshot(snapshot) {
		this.dispatch(snapshot);
	}

	updatingSnapshot() {
		this.dispatch();
	}
	diffingSnapshot() {
		this.dispatch();
	}

	diffSnapshot(diff) {
		this.dispatch(diff);
	}
}

module.exports = alt.createActions(SnapshotActions);