import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Repo from '../components/Repo';
import { fetchRepoList, editRepo, addRepo, deleteRepo } from '../actions';
import CreateRepo from '../components/Repo/create';
import classNames from 'classnames';

class RepoList extends Component {
    constructor(props) {
        super(props);
        this.handleRefresh = this.handleRefresh.bind(this);
        this.handleRepoEdit = this.handleRepoEdit.bind(this);
        this.handleRepoCreate = this.handleRepoCreate.bind(this);
        this.handleRepoDelete = this.handleRepoDelete.bind(this);
        this.toggleCreateNew = this.toggleCreateNew.bind(this);
        this.state = { showAddNew: false };
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

    handleRepoEdit(promise, repo) {
        const { dispatch } = this.props;
        dispatch(editRepo(repo));
        promise.resolve();
    }

    handleRepoCreate(promise, repo) {
        const { dispatch } = this.props;
        dispatch(addRepo(repo));
        promise.resolve();
    }

    handleRepoDelete(promise, repoName) {
        const { dispatch } = this.props;
        dispatch(deleteRepo(repoName));
        promise.resolve();
    }

    toggleCreateNew(e) {
        e.preventDefault();
        this.setState({ showAddNew: !this.state.showAddNew });
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
                    onSubmitEdit={ this.handleRepoEdit }
                    onDelete={ this.handleRepoDelete }
                    />
            });
        const createNew = (<CreateRepo key="$$create" onSubmit={ this.handleRepoCreate }/>);
        const createNewClasses = classNames('btn btn-success max-width', {
            active: this.state.showAddNew
        });
        return (
            <div className="container-fluid">
                <div className="col-xs-12 col-sm-1">
                    <h3>Repos</h3>
                    <p>
                        <button className="btn btn-primary max-width" onClick={this.handleRefresh}>Refresh</button>
                    </p>
                    <p>
                        <button className={ createNewClasses } onClick={ this.toggleCreateNew }>Create New</button>
                    </p>
                </div>
                <div className="col-xs-12 col-sm-11">
                    { this.state.showAddNew ? createNew : null }
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
