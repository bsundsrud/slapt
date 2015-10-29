import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Repo from '../components/Repo';
import { fetchRepoList } from '../actions';
class RepoList extends Component {
    constructor(props) {
        super(props);
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchRepoList());
    }

    handleRefresh(e) {
        e.preventDefault();
        const { dispatch } = this.props;
        dispatch(fetchRepoList());
    }

    render() {
        const { loading, repos } = this.props;
        var repoList = repos.map(repo => {
                return <Repo
                    name={ repo.Name }
                    key={ repo.Name }
                    comment={ repo.Comment }
                    distribution={ repo.Distribution }
                    component={ repo.Component }
                    />
            });
        return (
            <div className="container-fluid">
                <button className="btn btn-primary" onClick={this.handleRefresh}>Refresh</button>
                <div>
                    { loading ? 'Loading...' : repoList }
                </div>
            </div>
        );
    }
}

RepoList.propTypes = {
    loading: PropTypes.bool.isRequired,
    repos: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
};

function stateToProps(state) {
    const { repos } = state;
    return {
        repos: repos.items,
        loading: repos.loading
    }
}

export default connect(stateToProps)(RepoList);
