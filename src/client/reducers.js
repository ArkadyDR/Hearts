import { REQUEST_HAND, RECEIVE_HAND } from './actions';
function hands(state = {}, action = undefined) {
  switch (action.type) {
    case REQUEST_HAND:
      // TODO: Perhaps have some 'isLoading' state
      return state;
    case RECEIVE_HAND:
      return {
        ...state,
        [action.playerID]: action.cards,
      };
    default:
      return state;
  }
}

import { REQUEST_TRICKS, RECEIVE_TRICKS } from './actions';
function tricks(state = [], action = undefined) {
  switch (action.type) {
    case REQUEST_TRICKS:
      // TODO: Have an 'isLoading' state
      return state;
    case RECEIVE_TRICKS:
      return action.tricks;
    default:
      return state;
  }
}

import { REQUEST_SCORES, RECEIVE_SCORES } from './actions';
function scores(state = [], action = undefined) {
  switch (action.type) {
    case REQUEST_SCORES:
      // TODO: Have an 'isLoading' state
      return state;
    case RECEIVE_SCORES:
      return action.scores;
    default:
      return state;
  }
}

import { combineReducers } from 'redux';
const rootReducer = combineReducers({ hands, tricks, scores });
export default rootReducer;
