import React from 'react';
import SnapshotStore from '../stores/snapshotStore';
import AltContainer from 'alt/AltContainer';
import immutable from 'immutable';
import util from './util';

var SnapshotShortDetail = React.createClass({
	dropSnapshot: function(evt) {
		SnapshotStore.dropSnapshot(this.props.name);
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
			panelBody = (
				<div className="panel-body">
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

var SnapshotCreate = React.createClass({
	getInitialState: function() {
		return {
			data: immutable.Map({
				Name: '',
				Comment: '',
				DefaultDistribution: '',
				DefaultComponent: ''
			})
		};
	},
	createSnapshot: function(evt) {
		SnapshotStore.createSnapshot(this.state.data.toJS());
		this.setState(this.getInitialState());
		evt.preventDefault();
	},
	handleChangeFactory: function(field) {
		return function(evt) {

			this.setState({
				data: this.state.data.set(field, evt.target.value)
			});
		}.bind(this);
	},
	render: function() {
		var state = this.state.data;
		return (
			<form className="form-horizontal">
				<div className="form-group">
					<div className="col-sm-12">
						<input type="text" className="form-control" placeholder="Snapshot Name..." 
						value={state.get('Name')} onChange={this.handleChangeFactory('Name')} />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<input type="text" className="form-control" placeholder="Snapshot Comment..." 
						value={state.get('Comment')} onChange={this.handleChangeFactory('Comment')} />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<input type="text" className="form-control" placeholder="Default Dist..." 
						value={state.get('DefaultDistribution')} onChange={this.handleChangeFactory('DefaultDistribution')} />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<input type="text" className="form-control" placeholder="Default Component..." 
						value={state.get('DefaultComponent')} onChange={this.handleChangeFactory('DefaultComponent')} />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<button type="text" className="btn btn-default" onClick={this.createSnapshot}>Create</button>
					</div>
				</div>
			</form>
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
				<hr />
				<SnapshotCreate />
			</div>
		)
	}
});



module.exports = {
	SnapshotShortDetail: SnapshotShortDetail,
	SnapshotList: SnapshotList,
	SnapshotBox: SnapshotBox
}
