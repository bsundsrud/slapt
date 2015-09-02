import React from 'react';
import RepoStore from '../stores/repoStore';
import AltContainer from 'alt/AltContainer';
import immutable from 'immutable';
import util from './util';
import Popover from 'react-popover';


var RepoShortDetail = React.createClass({
	dropRepo: function(evt) {
		RepoStore.dropRepo(this.props.name);
		evt.preventDefault();
	},
	getInitialState: function() {
		return {
			opened: false,
			editing: false,
			repo: immutable.Map(this.props.repo),
			originalRepo: immutable.Map(this.props.repo),
			popoverOpen: false
		};
	},
	handleChangeFactory: function(field) {
		return function(evt) {
			this.setState({
				repo: this.state.repo.set(field, evt.target.value)
			});
		}.bind(this);
	},
	onChangeFactory: function(field) {
		return function(newValue) {
			this.setState({
				repo: this.state.repo.set(field, newValue)
			});
		}.bind(this);
	},
	toggleOpened: function(evt) {
		if (!this.state.opened) {
			RepoStore.getRepoPackages(this.state.repo.get('Name'));
		}
		this.setState({opened: !this.state.opened});
		evt.preventDefault();
	},
	startEdit: function(evt) {
		this.setState({editing: true});
	},
	saveAfterEdit: function(evt) {
		var updatedVals = this.state.repo.remove('Name');
		RepoStore.updateRepo(this.state.repo.get("Name"), updatedVals.toJS());
		this.setState({editing: false, originalRepo: this.state.repo});
		evt.preventDefault();
	},
	cancelEdit: function(evt) {
		this.setState({
			repo: this.state.originalRepo,
			editing: false
		});
	},
	togglePopover: function() {
		this.setState({
			popoverOpen: !this.state.popoverOpen
		});
	},
	render: function() {
		var comment = this.state.repo.get('Comment');
		var dist = this.state.repo.get('DefaultDistribution');
		var component = this.state.repo.get('DefaultComponent');
		var name = this.state.repo.get('Name');
		var caretBase = "panel-caret fa";
		var caretClass = caretBase + (this.state.opened ? " fa-caret-down" : " fa-caret-right");
		var packageCount = this.props.repo["Packages"] ? this.props.repo['Packages'].length : 'N/A';
		
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
			var popoverBody = (<p style={{backgroundColor: 'white'}}>I'm a popover</p>);
			var popoverTarget = (<button className="btn btn-default">Popover-trigger</button>);
			//var popover = Popover({isOpen: true});
			var popover = (
				<Popover isOpen={this.state.popoverOpen} body={popoverBody}>
					<button className="btn btn-default" onClick={this.togglePopover}>Popover-trigger</button>
				</Popover>
			);
			panelBody = (
				<div className="panel-body">
					<form className="form-horizontal col-xs-12" onSubmit={this.saveAfterEdit}>
						<util.EditableTextWithLabel 
							value={dist}
							onChange={this.onChangeFactory('DefaultDistribution')}
							editing={this.state.editing}
							label="Default Distribution:"
							defaultValue={name}
							placeholder="Default Distribution..." />
						<util.EditableTextWithLabel 
							value={component}
							onChange={this.onChangeFactory('DefaultComponent')}
							editing={this.state.editing}
							label="Default Component:"
							defaultValue="main"
							placeholder="Default Component..." />
						<div className="form-group">
							<label className="control-label col-xs-12 col-md-2">Packages:</label>
							<div className="col-xs-12 col-md-10">
								<label className="control-label inline-display-control">{packageCount}</label>
							</div>
						</div>
					</form>
					<hr />
					{editButton}
					{popover}
					
				</div>
			);
		}
		
		return (<div className="panel panel-default">
			<div className="panel-heading">
				<div className="row">
					<div className="col-xs-2">
						<i className={caretClass} onClick={this.toggleOpened}></i>
						{name} 
					</div>
					<div className="col-xs-9">
						<util.EditableText value={comment} 
										   onChange={this.onChangeFactory('Comment')}
										   editing={this.state.editing}
										   editClasses="form-control inline-edit-control"
										   placeholder="Comment..." 
										   defaultValue="No Comment."
										   displayClasses="small" />
					</div>
					<div className="col-xs-1">
						<span className="pull-right">
							<a onClick={this.dropRepo}><i className="fa fa-remove"></i></a>
						</span>
					</div>
				</div>
			</div>
			{panelBody}
		</div>)
	}
});

var RepoList = React.createClass({
	
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
		if (RepoStore.isLoading()) {
			return (
				<div>Loading...</div>
			)
		}
		var detailNodes = this.props.repoMap.map(function(repo) {
			return (
				<RepoShortDetail key={repo.Name} repo={repo} />
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

var RepoCreate = React.createClass({
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
	createRepo: function(evt) {
		RepoStore.createRepo(this.state.data.toJS());
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
						<input type="text" className="form-control" placeholder="Repo Name..." 
						value={state.get('Name')} onChange={this.handleChangeFactory('Name')} />
					</div>
				</div>
				<div className="form-group">
					<div className="col-sm-12">
						<input type="text" className="form-control" placeholder="Repo Comment..." 
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
						<button type="text" className="btn btn-default" onClick={this.createRepo}>Create</button>
					</div>
				</div>
			</form>
		)
	}
});

var RepoBox = React.createClass({
	componentDidMount: function() {
		RepoStore.listRepos();
	},
	render: function() {
		return (
			<div>
				<h3>Repos</h3>
				<AltContainer store={RepoStore}>
					<RepoList />
				</AltContainer>
				<hr />
				<RepoCreate />
			</div>
		)
	}
});



module.exports = {
	RepoShortDetail: RepoShortDetail,
	RepoList: RepoList,
	RepoBox: RepoBox
}
