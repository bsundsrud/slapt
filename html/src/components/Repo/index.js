import React, { Component, PropTypes } from 'react';
import './Repo.css';

class Repo extends Component {
    constructor(props) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.submit = this.submit.bind(this);
        this.state = { editing: false };
    }

    render() {
        if (this.state.editing) {
            return this.renderEdit();
        } else {
            return this.renderDisplay();
        }
    }

    submit(e) {
        e.preventDefault();
        console.log(e);
    }

    toggleEdit(e) {
        e.preventDefault();
        const { editing } = this.state;
        this.setState({ editing: !editing });
    }

    renderDisplay() {
        const { name, comment, distribution, component } = this.props;

        return (
            <div className="repo panel panel-default">
                <div className="panel-heading">
                    <span>{ name }</span><span className="pull-right disabled">Repo</span>
                </div>
                <div className="panel-body">
                    <p>{ comment }</p>
                    <p>Distribution: { distribution || 'None' } Component: { component || 'main' }</p>
                </div>
                <button className="btn btn-default" onClick={this.toggleEdit}>Edit</button>
            </div>);
    }

    renderEdit() {
        const { name, comment, distribution, component } = this.props;

        return (
            <div className="repo panel panel-default">
                <div className="panel-heading">
                    <span>{ name }</span><span className="pull-right disabled">Repo</span>
                </div>
                <div className="panel-body">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <label className="col-sm-3 control-label">Comment</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" defaultValue={ comment } ref={(ref) => this.commentInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-3 control-label">Distribution</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" defaultValue={ distribution } ref={(ref) => this.distInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="col-sm-3 control-label">Component</label>
                            <div className="col-sm-9">
                                <input type="text" className="form-control" defaultValue={ component } ref={(ref) => this.componenttInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-offset-3 col-sm-9">
                                <button className="btn btn-primary" onClick={this.submit}>Save</button>
                                <button className="btn btn-default" onClick={this.toggleEdit}>Cancel</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>);
    }
}

Repo.propTypes = {
    name: PropTypes.string.isRequired,
    comment: PropTypes.string,
    distribution: PropTypes.string,
    component: PropTypes.string,
    onSubmitEdit: PropTypes.func
};

export default Repo;
