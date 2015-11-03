import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Snapshot from '../components/Snapshot';
import { fetchSnapshotList } from '../actions';

class SnapshotList extends Component {
    constructor(props) {
        super(props);
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchSnapshotList());
    }

    handleRefresh(e) {
        e.preventDefault();
        const { dispatch } = this.props;
        dispatch(fetchSnapshotList());
    }

    render() {
        const { loading, snapshots } = this.props;
        var snapshotList = snapshots.map(snapshot => {
            return <Snapshot
                name={ snapshot.Name }
                key={ snapshot.Name }
                description={ snapshot.Description }
                />
        });
        return (
            <div className="container-fluid">
                <div className="col-xs-12 col-sm-1">
                    <h3>Snapshots</h3>
                    <button className="btn btn-primary" onClick={this.handleRefresh}>Refresh</button>
                </div>
                <div className="col-xs-12 col-sm-11">
                    { loading ? 'Loading...' : snapshotList }
                </div>
            </div>
        );
    }
}

SnapshotList.propTypes = {
    loading: PropTypes.bool.isRequired,
    snapshots: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
};

function stateToProps(state) {
    const { snapshots } = state;
    return {
        snapshots: snapshots.items,
        loading: snapshots.loading
    }
}

export default connect(stateToProps)(SnapshotList);