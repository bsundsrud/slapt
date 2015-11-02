import { combineReducers } from 'redux';
import * as actions from './actions';

function repos(state = [], action = undefined) {
    switch (action.type) {
        case actions.ADD_REPO:
            return [
                action.repo,
                ...state
            ];
        case actions.FETCH_REPO_LIST:
            switch (action.status) {
                case 'pending':
                    return {
                        loading: true,
                        items: []
                    };
                case 'success':
                    return {
                        loading: false,
                        items: action.repos
                    };
            }
            return {
                loading: false,
                items: []
            };
        case actions.DELETE_REPO:
            return state.filter(repo => repo.name !== action.repoName);
        case actions.EDIT_REPO:
            return state.map(repo =>
                repo.name === action.repo.name ? Object.assign({}, repo, action.repo) : repo)
    }
    return state;
}

function snapshots(state = [], action = undefined) {
    switch (action.type) {
        case actions.FETCH_SNAPSHOT_LIST:
            switch (action.status) {
                case 'pending':
                    return {
                        loading: true,
                        items: []
                    };
                case 'success':
                    return {
                        loading: false,
                        items: action.snapshots
                    };
            }
            return {
                loading: false,
                items: []
            };
        case actions.ADD_SNAPSHOT:
            return [
                action.snapshot,
                ...state
            ];
        case actions.DELETE_SNAPSHOT:
            return state.filter(snapshot => snapshot.name !== action.snapshotName);
        case actions.EDIT_SNAPSHOT:
            return state.map(snapshot =>
                snapshot.name === action.snapshot.name ? Object.assign({}, snapshot, action.snapshot) : snapshot)
    }
    return state;
}

function endpoints(state = [], action = undefined) {
    switch (action.type) {
        case actions.FETCH_ENDPOINT_LIST:
            switch (action.status) {
                case 'pending':
                    return {
                        loading: true,
                        items: []
                    };
                case 'success':
                    return {
                        loading: false,
                        items: action.endpoints
                    };
            }
            return {
                loading: false,
                items: []
            };
        case actions.ADD_ENDPOINT:
            return [
                action.endpoint,
                ...state
            ];
        case actions.DELETE_ENDPOINT:
            return state.filter(endpoint => endpoint.name !== action.endpointName);
        case actions.EDIT_ENDPOINT:
            return state.map(endpoint =>
                endpoint.name === action.endpoint.name ? Object.assign({}, endpoint, action.endpoint) : endpoint)
    }
    return state;
}

const reducer = combineReducers({
    repos,
    snapshots,
    endpoints
});

export default reducer;
