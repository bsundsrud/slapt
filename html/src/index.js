import React, { Component } from 'react';
import 'babel/polyfill';
import { render } from 'react-dom';
import './styles';
import configureStore from './store';
import { addRepo, editRepo, deleteRepo } from './actions';
import { Provider } from 'react-redux';
import RepoList from './containers/RepoList';

const initialState = {
    repos: {
        loading: false,
        items: []
    },
    snapshots: [],
    endpoints: []
};

const store = configureStore(initialState);

let unsub = store.subscribe((something) => console.log(store.getState()));

class Main extends Component {
    render() {
        return (<div>Hello, World!</div>)
    }
}

render(
    <Provider store={store}>
        <RepoList/>
    </Provider>,
    document.getElementById('root'));

