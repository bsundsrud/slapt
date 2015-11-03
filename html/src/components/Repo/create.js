import React, { Component, PropTypes } from 'react';
import './Repo.css';
class CreateRepo extends Component {
    constructor(props) {
        super(props);
        this.clear = this.clear.bind(this);
        this.submit = this.submit.bind(this);
    }

    clear(e) {
        if (e) {
            e.preventDefault();
        }
        this.nameInput.value = '';
        this.commentInput.value = '';
        this.componentInput.value = '';
        this.distInput.value = '';
    }

    submit(e) {
        e.preventDefault();
        const newRepo = {
            Name: this.nameInput.value,
            Comment: this.commentInput.value,
            Distribution: this.distInput.value,
            Component: this.componentInput.value
        };
        const f = (resolve, reject) => {
            this.props.onSubmit({ resolve, reject }, newRepo);
        };
        var p = new Promise(f);
        p.then(() => this.clear(), () => {});
    }

    render() {
        return (
            <div className="repo panel panel-default">
                <div className="panel-heading">
                    <span>Create New</span>
                </div>
                <div className="panel-body">
                    <form className="form-horizontal">
                        <div className="form-group">
                            <div className="col-sm-12">
                                <input type="text" className="form-control" placeholder="Repo Name" ref={(ref) => this.nameInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-12">
                                <input type="text" className="form-control" placeholder="Comment" ref={(ref) => this.commentInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-12">
                                <input type="text" className="form-control" placeholder="Default Distribution" ref={(ref) => this.distInput = ref }/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="col-sm-12">
                                <input type="text" className="form-control" placeholder="Default Component" ref={(ref) => this.componentInput = ref }/>
                            </div>
                        </div>

                        <button className="btn btn-success max-width" onClick={this.submit}>Create</button>
                    </form>
                </div>
            </div>

        );
    }
}

CreateRepo.propTypes = {
    onSubmit: PropTypes.func.isRequired
};

export default CreateRepo;