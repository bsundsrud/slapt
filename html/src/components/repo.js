import React from 'react';
import RepoStore from '../stores/repoStore';
import AltContainer from 'alt/AltContainer';
import immutable from 'immutable';

var RepoShortDetail = React.createClass({
	dropRepo: function(evt) {
		RepoStore.dropRepo(this.props.name);
		evt.preventDefault();
	},
	getInitialState: function() {
		return {
			opened: false
		};
	},
	toggleOpened: function(evt) {
		this.setState({opened: !this.state.opened});
		evt.preventDefault();
	},
	render: function() {
		var comment = this.props.repo.Comment || (<em>No Comment.</em>);
		var dist = this.props.repo.DefaultDistribution || (<em>{this.props.repo.Name}</em>);
		var component = this.props.repo.DefaultComponent || (<em>main</em>);
		var caretBase = "fa";
		var caretClass = caretBase + (this.state.opened ? " fa-caret-down" : " fa-caret-right");
		var caretStyle = {
			fontSize: '1.4em',
			width: '1.1em',
			cursor: 'pointer'
		};
		var panelBody = '';
		if (this.state.opened) {
			panelBody = (
				<div className="panel-body">
					<p>Default Distribution: {dist}</p>
					<p>Default Component: {component}</p>
				</div>
			);
		}

		return (<div className="panel panel-default">
			<div className="panel-heading">
				<i className={caretClass} style={caretStyle} onClick={this.toggleOpened}></i>
				{ this.props.repo.Name } <span className="small"> { comment }</span>
				<span className="pull-right">
					<a onClick={this.dropRepo}><i className="fa fa-remove"></i></a>
				</span>
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
		var detailNodes = this.props.repos.map(function(repo) {
			return (
				<RepoShortDetail key={repo.Name} repo={repo} />
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
