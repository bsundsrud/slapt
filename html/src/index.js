import React, { Component } from 'react';
import 'babel/polyfill';
import { render } from 'react-dom';
import './styles';
import configureStore from './store';
import { addRepo, editRepo, deleteRepo } from './actions';
import { Provider } from 'react-redux';
import RepoList from './containers/RepoList';
import SnapshotList from './containers/SnapshotList';
import EndpointList from './containers/EndpointList';

const initialState = {
    repos: {
        loading: false,
        items: []
    },
    snapshots: {
        loading: false,
        items: []
    },
    endpoints: {
        loading: false,
        items: []
    }
};

const store = configureStore(initialState);

class RootElement extends Component {
    render() {
        return (
            <div>
                <RepoList/>
                <hr/>
                <SnapshotList/>
                <hr/>
                <EndpointList/>
            </div>);
    }
}

render(
    <Provider store={store}>
        <RootElement/>
    </Provider>,
    document.getElementById('root'));

