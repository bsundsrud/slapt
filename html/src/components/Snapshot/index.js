import React, { Component, PropTypes } from 'react';
import './Snapshot.css';

class Snapshot extends Component {
    render() {
        const { name, description } = this.props;

        return (
            <div className="snapshot panel panel-default">
                <div className="panel-heading">
                    <span>{ name }</span><span className="pull-right disabled">Snapshot</span>
                </div>
                <div className="panel-body">
                    <p>{ description }</p>
                </div>
            </div>);
    }
}

Snapshot.propTypes = {
    name: PropTypes.string.isRequired,
    comment: PropTypes.string
};

export default Snapshot;
