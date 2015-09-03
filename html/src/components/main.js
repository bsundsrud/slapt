import React from 'react';
import Repo from './repo';
import Snapshot from './snapshot';
import Mirror from './mirror';
import axios from 'axios';

axios.interceptors.response.use(
	function(resp) { 
		return resp.data; 
	},
	function(resp) {
		return Promise.reject({
			errors: resp.data,
			status: resp.status,
			statusText: resp.statusText
		});
	}
);

var Main = React.createClass({
	render() {
		return (
			<div className="row">
				<div className="col-xs-12">
					<Repo.RepoBox/>
				</div>
				<div className="col-xs-12">
					<Snapshot.SnapshotBox/>
				</div>
				<div className="col-xs-12">
					<Mirror.MirrorBox/>
				</div>
			</div>
		);
	}
});

module.exports = Main;
