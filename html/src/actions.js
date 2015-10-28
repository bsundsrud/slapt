
export const ADD_REPO = 'ADD_REPO';
export const EDIT_REPO = 'EDIT_REPO';
export const DELETE_REPO = 'DELETE_REPO';

export const ADD_SNAPSHOT = 'ADD_SNAPSHOT';
export const EDIT_SNAPSHOT = 'EDIT_SNAPSHOT';
export const DELETE_SNAPSHOT = 'DELETE_SNAPSHOT';

export const SNAPSHOT_FROM_REPO = 'SNAPSHOT_FROM_REPO';

export function addRepo(repo) {
    return {
        type: ADD_REPO,
        repo
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
