import fetch from 'isomorphic-fetch';

export const REQUEST_HAND = 'REQUEST_HAND';
function requestHand(playerID) {
  return {
    type: REQUEST_HAND,
    playerID,
  };
}

export const RECEIVE_HAND = 'RECEIVE_HAND';
function receiveHand(playerID, cards) {
  return {
    type: RECEIVE_HAND,
    playerID,
    cards,
  };
}

export function fetchHand(playerID) {
  return dispatch => {
    dispatch(requestHand(playerID));
    return fetch(`http://localhost:3000/game/hands/${playerID}`)
      .then(response => response.json())
      .then(json => dispatch(receiveHand(playerID, json.cards)));
  };
}

export const REQUEST_TRICKS = 'REQUEST_TRICKS';
function requestTricks() {
  return {
    type: REQUEST_TRICKS,
  };
}

export const RECEIVE_TRICKS = 'RECEIVE_TRICKS';
function receiveTricks(tricks) {
  return {
    type: RECEIVE_TRICKS,
    tricks,
  };
}

export function fetchTricks() {
  return dispatch => {
    dispatch(requestTricks());
    return fetch('http://localhost:3000/game/tricks')
      .then(response => response.json())
      .then(json => dispatch(receiveTricks(json)));
  };
}

export const REQUEST_SCORES = 'REQUEST_SCORES';
function requestScores() {
  return {
    type: REQUEST_SCORES,
  };
}

export const RECEIVE_SCORES = 'RECEIVE_SCORES';
function receiveScores(scores) {
  return {
    type: RECEIVE_SCORES,
    scores,
  };
}

export function fetchScores() {
  return dispatch => {
    dispatch(requestScores());
    return fetch('http://localhost:3000/game/scores')
      .then(response => response.json())
      .then(json => dispatch(receiveScores(json)));
  };
}

export function playCard(playerID, card) {
  return dispatch =>
    fetch(`http://localhost:3000/game/play/${playerID}`, { method: 'POST', body: JSON.stringify(card) })
      .then(response => {
        if (response.status === 200) {
          dispatch(fetchHand(0));
          dispatch(fetchHand(1));
          dispatch(fetchHand(2));
          dispatch(fetchHand(3));
          dispatch(fetchTricks());
          dispatch(fetchScores());
        } else {
          alert(`Invalid. ${response.body.reason}`);
        }
      });
}
