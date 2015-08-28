import React from 'react';
import reqwest from 'reqwest';

var RepoShortDetail = React.createClass({
	render: function() {
		return (<div className="well well-sm">
			<h4>{ this.props.name }</h4>
			<p className="small">{ this.props.comment }</p>
		</div>)
	}
});

var RepoList = React.createClass({
	
	render: function() {
		var detailNodes = this.props.data.map(function(repo) {
			return (
				<RepoShortDetail key={repo.Name} name={repo.Name} comment={repo.Comment}/>
			)
		})
		return (
			<div>
				{detailNodes}
			</div>
		)
	}
});

var RepoBox = React.createClass({
	getInitialState: function() {
		return {data: []};
	},
	componentDidMount: function() {
		reqwest({
			url: 'http://localhost:8081/api/repos',
			method: 'get',
			success: function (resp) {
				this.setState({data: resp});
			}.bind(this)
		});
	},
	render: function() {
		return (
			<div>
				<h3>Repos</h3>
				<RepoList data={this.state.data} />
			</div>
		)
	}
});

module.exports = {
	RepoShortDetail: RepoShortDetail,
	RepoList: RepoList,
	RepoBox: RepoBox
}
