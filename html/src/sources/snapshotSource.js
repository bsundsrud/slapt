import SnapshotActions from '../actions/snapshotActions';
import axios from 'axios';

var SnapshotSource = {
	listSnapshots() {
		return {
			remote() {
				return axios.get('/api/snapshots');
			},
			local() {
				return null;
			},
			success: SnapshotActions.loadSnapshots,
			error: SnapshotActions.opFailed,
			loading: SnapshotActions.loadingSnapshots
		};
	},

	createSnapshot() {
		return {
			remote(snapshots, newSnapshot) {
				return axios.post('/api/snapshots', newSnapshot);
			},
			local() {
				return null;
			},
			success: SnapshotActions.createSnapshot,
			error: SnapshotActions.opFailed,
			loading: SnapshotActions.creatingSnapshot
		};
	},

	updateSnapshot() {
		return {
			remote(snapshots, snapshotName, updates) {
				return axios.put('/api/snapshots/' + snapshotName, updates);
			},
			local() {
				return null;
			},
			success: SnapshotActions.updateSnapshot,
			error: SnapshotActions.opFailed,
			loading: SnapshotActions.updatingSnapshot
		};
	},

	dropSnapshot() {
		return {
			remote(snapshots, snapshotName) {
				return axios.delete('/api/snapshots/' + snapshotName);
			},
			local() {
				return null;
			},
			success: SnapshotActions.dropSnapshot,
			error: SnapshotActions.opFailed,
			loading: SnapshotActions.droppingSnapshot
		};
	}
}

module.exports = SnapshotSource;