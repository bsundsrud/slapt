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
    return state;
}

function endpoints(state = [], action = undefined) {
    return state;
}

const reducer = combineReducers({
    repos,
    snapshots,
    endpoints
});

export default reducer;
