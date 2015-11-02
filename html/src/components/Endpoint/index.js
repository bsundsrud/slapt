import React, { Component, PropTypes } from 'react';
import './Endpoint.css';

class Endpoint extends Component {
    render() {
        const { name } = this.props;

        return (
            <div className="endpoint panel panel-default">
                <div className="panel-heading">
                    <span>{ name }</span><span className="pull-right disabled">Endpoint</span>
                </div>
                <div className="panel-body">
                </div>
            </div>);
    }
}

Endpoint.propTypes = {
    name: PropTypes.string.isRequired
};

export default Endpoint;
