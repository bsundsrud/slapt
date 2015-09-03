import React from 'react';
import SnapshotStore from '../stores/snapshotStore';
import AltContainer from 'alt/AltContainer';
import immutable from 'immutable';
import util from './util';
import moment from 'moment';

var SnapshotShortDetail = React.createClass({
	dropSnapshot: function(evt) {
		SnapshotStore.dropSnapshot(this.state.snapshot.get('Name'));
		evt.preventDefault();
	},
	getInitialState: function() {
		return {
			opened: false,
			editing: false,
			snapshot: immutable.Map(this.props.snapshot),
			originalSnapshot: immutable.Map(this.props.snapshot)
		};
	},
	handleChangeFactory: function(field) {
		return function(evt) {
			this.setState({
				snapshot: this.state.snapshot.set(field, evt.target.value)
			});
		}.bind(this);
	},
	onChangeFactory: function(field) {
		return function(newValue) {
			this.setState({
				snapshot: this.state.snapshot.set(field, newValue)
			});
		}.bind(this);
	},
	toggleOpened: function(evt) {
		this.setState({opened: !this.state.opened});
		evt.preventDefault();
	},
	startEdit: function(evt) {
		this.setState({editing: true});
	},
	saveAfterEdit: function(evt) {
		var updatedVals = this.state.snapshot.remove('Name');
		SnapshotStore.updateSnapshot(this.state.snapshot.get("Name"), updatedVals.toJS());
		this.setState({editing: false, originalSnapshot: this.state.snapshot});
		evt.preventDefault();
	},
	cancelEdit: function(evt) {
		this.setState({
			snapshot: this.state.originalSnapshot,
			editing: false
		});
	},
	render: function() {
		var description = this.state.snapshot.get('Description');
		var caretBase = "panel-caret fa";
		var caretClass = caretBase + (this.state.opened ? " fa-caret-down" : " fa-caret-right");
		
		var editButton = (<button className="btn btn-default" onClick={this.startEdit}>Edit</button>);

		if (this.state.editing) {
			editButton = (
				<div className="btn-group">
					<button className="btn btn-success" onClick={this.saveAfterEdit}>Save</button>
					<button className="btn btn-danger" onClick={this.cancelEdit}>Cancel</button>
				</div>
			);
		}

		var panelBody = '';
		if (this.state.opened) {
			var created = moment(this.state.snapshot.get('CreatedAt'));
			panelBody = (
				<div className="panel-body">
					<dl className="dl-horizontal">
						<dt>Created:</dt>
						<dd>{created.format('MMMM Do YYYY, h:mm:ss a')} <em className="small">({created.fromNow()})</em></dd>
					</dl>
					{editButton}
				</div>
			);
		}
		return (<div className="panel panel-default">
			<div className="panel-heading">
				<div className="row">
					<div className="col-xs-2">
						<i className={caretClass} onClick={this.toggleOpened}></i>
						{this.state.snapshot.get('Name')} 
					</div>
					<div className="col-xs-9">
						<util.EditableText value={description} 
										   onChange={this.onChangeFactory('Description')}
										   editing={this.state.editing}
										   editClasses="form-control inline-edit-control"
										   placeholder="Description..." 
										   defaultValue="No Description."
										   displayClasses="small" />
					</div>
					<div className="col-xs-1">
						<span className="pull-right">
							<a onClick={this.dropSnapshot}><i className="fa fa-remove"></i></a>
						</span>
					</div>
				</div>
			</div>
			{panelBody}
		</div>)
	}
});

var SnapshotList = React.createClass({
	
	render: function() {
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
		if (SnapshotStore.isLoading()) {
			return (
				<div>Loading...</div>
			)
		}
		var detailNodes = this.props.snapshots.map(function(snapshot) {
			return (
				<SnapshotShortDetail key={snapshot.Name} snapshot={snapshot} />
			)
		})
		return (
			<div>
				{errorFlash}
				{detailNodes}
			</div>
		)
	}
});

var SnapshotBox = React.createClass({
	componentDidMount: function() {
		SnapshotStore.listSnapshots();
	},
	render: function() {
		return (
			<div>
				<h3>Snapshots</h3>
				<AltContainer store={SnapshotStore}>
					<SnapshotList />
				</AltContainer>
			</div>
		)
	}
});



module.exports = {
	SnapshotShortDetail: SnapshotShortDetail,
	SnapshotList: SnapshotList,
	SnapshotBox: SnapshotBox
}
