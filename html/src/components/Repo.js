import React, { Component, PropTypes } from 'react';
import './Repo.css';

class Repo extends Component {
    render() {
        const { name, comment, distribution, component } = this.props;

        return (
            <div className="repo panel panel-default">
                <div className="panel-heading">
                    <span>{ name }</span><span className="pull-right disabled">Repo</span>
                </div>
                <div className="panel-body">
                    <p>{ comment }</p>
                    <p>Distribution: { distribution || 'None' } Component: { component || 'None' }</p>
                </div>
            </div>);
    }
}

Repo.propTypes = {
    name: PropTypes.string.isRequired,
    comment: PropTypes.string,
    distribution: PropTypes.string,
    component: PropTypes.string
};

export default Repo;
