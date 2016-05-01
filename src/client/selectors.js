import { createSelector } from 'reselect';
import { validateCardIsLegal } from '../game/hearts';

const getTricks = (state) => state.tricks;
const getHand = (state, props) => state.hands[props.id];
const getIsNext = (state, props) => state.tricks.length === 0 || state.tricks[state.tricks.length - 1].next === props.id;

export const makeGetCardsForPlayer = () => createSelector(
  [getTricks, getHand, getIsNext],
  (tricks, hand, isNext) => {
    const cards = [];

    if (tricks.length > 0 && hand) {
      for (const card of hand) {
        cards.push({
          ...card,
          valid: isNext && validateCardIsLegal(hand, tricks, card),
        });
      }
    }

    return cards;
  }
);
