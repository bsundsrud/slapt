var SnapshotActions = require('../actions/snapshotActions');
var SnapshotSource = require('../sources/snapshotSource');
var immutable = require('immutable');
var alt = require('../alt');

class SnapshotStore {
	constructor() {
		this.snapshots = immutable.List();
		this.errorMessage = null;
		this.bindListeners({
			handleError: SnapshotActions.OP_FAILED,
			handleLoadingSnapshots: SnapshotActions.LOADING_SNAPSHOTS,
			handleLoadSnapshots: SnapshotActions.LOAD_SNAPSHOTS,
			handleCreateSnapshot: SnapshotActions.CREATE_SNAPSHOT,
			handleUpdateSnapshot: SnapshotActions.UPDATE_SNAPSHOT,
			handleDropSnapshot: SnapshotActions.DROP_SNAPSHOT	
		});
		this.exportAsync(SnapshotSource);
	}

	handleError(message) {
		this.errorMessage = message;
	}

	handleLoadingSnapshots() {
		this.snapshots = immutable.List();
	}

	handleLoadSnapshots(snapshots) {
		this.snapshots = immutable.List(snapshots);
		this.errorMessage = null;
	}

	handleCreateSnapshot(snapshot) {
		this.snapshots = this.snapshots.push(snapshot);
	}

	handleUpdateSnapshot(snapshot) {
		this.snapshots = this.snapshots.map(function(s) {
			if (s.Name == snapshot.Name) {
				return snapshot;
			} else {
				return s;
			}
		});
	}

	handleDropSnapshot(snapshotName) {
		this.snapshots = this.snapshots.filter(function(s) {
			if (s.Name == snapshotName) {
				return false;
			}
			return true;
		})
	}
}

module.exports = alt.createStore(SnapshotStore, 'SnapshotStore');