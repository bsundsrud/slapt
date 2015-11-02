import fetch from 'isomorphic-fetch';

export const FETCH_REPO_LIST = 'FETCH_REPO_LIST';

export const ADD_REPO = 'ADD_REPO';
export const EDIT_REPO = 'EDIT_REPO';
export const DELETE_REPO = 'DELETE_REPO';

export const FETCH_SNAPSHOT_LIST = 'FETCH_SNAPSHOT_LIST';

export const ADD_SNAPSHOT = 'ADD_SNAPSHOT';
export const EDIT_SNAPSHOT = 'EDIT_SNAPSHOT';
export const DELETE_SNAPSHOT = 'DELETE_SNAPSHOT';

export const SNAPSHOT_FROM_REPO = 'SNAPSHOT_FROM_REPO';

export const FETCH_ENDPOINT_LIST = 'FETCH_ENDPOINT_LIST';

export const ADD_ENDPOINT = 'ADD_ENDPOINT';
export const DELETE_ENDPOINT = 'DELETE_ENDPOINT';

export function addRepo(repo) {
    return {
        type: ADD_REPO,
        repo
    }
}

function reposRequested() {
    return {
        type: FETCH_REPO_LIST,
        status: 'pending'
    }
}

function reposFetched(repos) {
    return {
        type: FETCH_REPO_LIST,
        status: 'success',
        repos
    }
}

export function fetchRepoList() {
    return (dispatch) => {
        dispatch(reposRequested());
        return fetch('/api/repos')
            .then(response => response.json())
            .then(json => dispatch(reposFetched(json)))
    }
}

function snapshotsRequested() {
    return {
        type: FETCH_SNAPSHOT_LIST,
        status: 'pending'
    }
}

function snapshotsFetched(snapshots) {
    return {
        type: FETCH_SNAPSHOT_LIST,
        status: 'success',
        snapshots
    }
}

export function fetchSnapshotList() {
    return (dispatch) => {
        dispatch(snapshotsRequested());
        return fetch('/api/snapshots')
            .then(response => response.json())
            .then(json => dispatch(snapshotsFetched(json)));
    }
}

export function editRepo(repo) {
    return {
        type: EDIT_REPO,
        repo
    }
}

export function deleteRepo(repoName) {
    return {
        type: DELETE_REPO,
        repoName
    }
}

export function addEndpoint(endpoint) {
    return {
        type: ADD_ENDPOINT,
        endpoint
    }
}

export function deleteEndpoint(endpointName) {
    return {
        type: ADD_ENDPOINT,
        endpointName
    }
}

function endpointsRequested() {
    return {
        type: FETCH_ENDPOINT_LIST,
        status: 'pending'
    }
}

function endpointsFetched(endpoints) {
    return {
        type: FETCH_ENDPOINT_LIST,
        status: 'success',
        endpoints
    }
}

export function fetchEndpointList() {
    return (dispatch) => {
        dispatch(endpointsRequested());
        return fetch('/api/publish')
            .then(response => response.json())
            .then(json => dispatch(endpointsFetched(json)));
    }
}
