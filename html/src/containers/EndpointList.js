import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Endpoint from '../components/Endpoint';
import { fetchEndpointList } from '../actions';

class EndpointList extends Component {
    constructor(props) {
        super(props);
        this.handleRefresh = this.handleRefresh.bind(this);
    }

    componentDidMount() {
        const { dispatch } = this.props;
        dispatch(fetchEndpointList());
    }

    handleRefresh(e) {
        e.preventDefault();
        const { dispatch } = this.props;
        dispatch(fetchEndpointList());
    }

    render() {
        const { loading, endpoints } = this.props;
        var endpointList = endpoints.map(endpoint => {
            return <Endpoint
                name={ endpoint.Name }
                key={ endpoint.Name }
                />
        });
        return (
            <div className="container-fluid">
                <div className="col-xs-12 col-sm-1">
                    <h3>Endpoints</h3>
                    <button className="btn btn-primary" onClick={this.handleRefresh}>Refresh</button>
                </div>
                <div className="col-xs-12 col-sm-11">
                    { loading ? 'Loading...' : endpointList }
                </div>
            </div>
        );
    }
}

EndpointList.propTypes = {
    loading: PropTypes.bool.isRequired,
    endpoints: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
};

function stateToProps(state) {
    const { endpoints } = state;
    return {
        endpoints: endpoints.items,
        loading: endpoints.loading
    }
}

export default connect(stateToProps)(EndpointList);