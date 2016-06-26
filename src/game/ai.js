import Lodash from 'lodash';
import * as Hearts from './hearts';

export function chooseCardToPlay(hand, tricks) {
  return Lodash.find(hand, card => Hearts.validateCardIsLegal(hand, tricks, card));
}
