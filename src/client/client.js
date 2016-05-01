// Grab the index.html file with the build
require('copy!./index.html');

import React from 'react';
import ReactDOM from 'react-dom';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';

import heartsGame from './reducers';
import { fetchHand, fetchTricks, fetchScores } from './actions';
import App from './App';

const loggerMiddleware = createLogger();

const createStoreWithMiddleware = applyMiddleware(
  thunkMiddleware,
  loggerMiddleware,
)(createStore);

const store = createStoreWithMiddleware(heartsGame);

store.dispatch(fetchHand(0));
store.dispatch(fetchHand(1));
store.dispatch(fetchHand(2));
store.dispatch(fetchHand(3));
store.dispatch(fetchTricks());
store.dispatch(fetchScores());

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  document.getElementById('root')
);
