import { createStore, applyMiddleware } from 'redux';
import reducer from './reducers';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

const createStoreWithMiddleware = applyMiddleware(
    thunkMiddleware,
    createLogger({collapsed: true})
)(createStore);

export default function configureStore(initialState) {
    const store = createStoreWithMiddleware(reducer, initialState);

    if (module.hot) {
        // Enable Webpack hot module replacement for reducers
        module.hot.accept('./reducers', () => {
        const nextReducer = require('./reducers');
            store.replaceReducer(nextReducer);
        });
    }

  return store;
}