import React, { Component, PropTypes } from 'react';
import './Repo.css';

class Repo extends Component {
    constructor(props) {
        super(props);
        this.toggleEdit = this.toggleEdit.bind(this);
        this.submit = this.submit.bind(this);
        this.deleteRepo = this.deleteRepo.bind(this);
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
        if (this.props.onSubmitEdit) {
            const f = (resolve, reject) => {
                this.props.onSubmitEdit({ resolve, reject }, {
                    Name: this.props.name,
                    Comment: this.commentInput.value,
                    Distribution: this.distInput.value,
                    Component: this.componentInput.value
                });
            };
            var p = new Promise(f);
            p.then(() => this.setState({editing: false}), () => {});
        }
    }

    deleteRepo(e) {
        e.preventDefault();
        const f = (resolve, reject) => {
            this.props.onDelete({ resolve, reject}, this.props.name);
        };
        var p = new Promise(f);
        p.then(() => {},() => {});
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
                    <hr/>
                    <p className="small">Distribution: { distribution || 'None' }</p>
                    <p className="small">Component: { component || 'main' }</p>
                    <button className="btn btn-default" onClick={this.toggleEdit}>Edit</button>
                </div>
            </div>);
    }

    renderEdit() {
        const { name, comment, distribution, component } = this.props;

        return (
            <div className="repo panel panel-default">
                <div className="panel-heading">
                    <span>{ name }</span><a className="text-danger pull-right" onClick={ this.deleteRepo }><i className="fa fa-trash-o"></i> Delete</a>
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
                                <input type="text" className="form-control" defaultValue={ component } ref={(ref) => this.componentInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-6">
                                <button className="btn btn-primary max-width" onClick={this.submit}>Save</button>
                            </div>
                            <div className="col-sm-6">
                                <button className="btn btn-default max-width" onClick={this.toggleEdit}>Cancel</button>
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
    onSubmitEdit: PropTypes.func,
    onDelete: PropTypes.func.isRequired
};

export default Repo;
