import React from 'react';
import MirrorStore from '../stores/mirrorStore';
import AltContainer from 'alt/AltContainer';
import SnapshotStore from '../stores/snapshotStore';
import moment from 'moment';
import util from './util';


var MirrorDetail = React.createClass({
	render() {
		var mirror = this.props.mirror;
		var lastUpdate = moment(mirror.LastDownloadDate);
		return (
			<div className="panel panel-default">
				<div className="panel-heading">
					{mirror.Name}
				</div>
				<div className="panel-body">
					<dl className="dl-contiguous dl-horizontal">
						<dt>Distribution:</dt>
						<dd>{mirror.Distribution}</dd>
						<dt>Components:</dt>
						<dd>{mirror.Components.join(', ')}</dd>
						<dt>Architectures:</dt>
						<dd>{mirror.Architectures.join(', ')}</dd>
						<dt>Last Updated:</dt>
						<dd>
							{lastUpdate.format('MMMM Do YYYY, h:mm:ss a')} - <em className="small">{lastUpdate.fromNow()}</em>
						</dd>
					</dl>
					<util.Expandable>
						<dl className="dl-horizontal">
							<dt>Label:</dt>
							<dd>{mirror.Meta.Label}</dd>
							<dt>Origin:</dt>
							<dd>{mirror.Meta.Origin}</dd>
							<dt>Suite:</dt>
							<dd>{mirror.Meta.Suite}</dd>
							<dt>Filter:</dt>
							<dd>{mirror.Filter}</dd>
						</dl>
					</util.Expandable>
					<div className="btn-group btn-group-justified">
						<a className="btn btn-primary">Create Snapshot</a>
						<a className="btn btn-default">Update Mirror</a>
						<a className="btn btn-default">Edit</a>
					</div>
				</div>
			</div>
		);
	}
});

var MirrorList = React.createClass({
	render() {
		var errorFlash = '';
		if (this.props.errorMessage) {
			var errObj = this.props.errorMessage;
			errorFlash = (
				<div className="alert alert-danger">
					<p><strong>{errObj.status}: {errObj.statusText}</strong></p>
					<ul>
					{errObj.errors.map(e => {
						return (
							<li key={e.error}>{e.error}</li>
						)
					})}
					</ul>
				</div>
			);
		}
		if (MirrorStore.isLoading()) {
			return (
				<div>Loading...</div>
			)
		}
		var detailNodes = this.props.mirrorMap.map(function(mirror) {
			return (
				<MirrorDetail key={mirror.Name} mirror={mirror} />
			)
		}).toArray();
		return (
			<div>
				{errorFlash}
				{detailNodes}
			</div>
		)
	}
});

var MirrorBox = React.createClass({
	componentDidMount() {
		MirrorStore.loadMirrors();
	},
	render() {
		return (
			<div>
				<h3>Mirrors</h3>
				<AltContainer store={MirrorStore}>
					<MirrorList />
				</AltContainer>
			</div>
		);
	}
});

module.exports = {
	MirrorBox: MirrorBox
};