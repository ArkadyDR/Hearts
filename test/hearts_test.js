import { assert } from 'chai';
import Lodash from 'lodash';
import fs from 'fs';

import {
  play,
  INVALID_ILLEGAL_PLAY,
  INVALID_UNOWNED_CARD,
  INVALID_WRONG_PLAYER
} from '../src/game/hearts';

function loadInitialGame() {
  return JSON.parse(fs.readFileSync('./test/initial_state.json', 'utf8'));
}

describe('Hearts', () => {
  describe('checkTestData', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
    });

    it('uniqueCards', () => {
      assert.equal(Lodash.uniqWith(Lodash.flatten(game.hands), Lodash.isEqual).length, 52);
    });

    it('correctHandSizes', () => {
      for (let idx = 0; idx < 4; idx++) {
        assert.equal(game.hands[idx].length, 13);
      }
    });
  });

  describe('initialPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
    });

    it('wrongPlayer', () => {
      // it is player 0's turn
      const result = play(1, game, { suit: 'clubs', face: 4 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_WRONG_PLAYER);
    });

    it('not2ofClubs', () => {
      // player 0 has the 9 of clubs, but is required to play the 2
      const result = play(0, game, { suit: 'clubs', face: 9 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('2ofClubs', () => {
      // this is the only valid initial play
      const result = play(0, game, { suit: 'clubs', face: 2 });
      assert.isTrue(result.success, '2 of clubs was not valid');

      const hand = result.game.hands[0];
      assert.equal(hand.length, 12, 'card not removed from hand');
      assert.isFalse(Lodash.some(hand, card => card.suit === 'clubs' && card.face === 2),
        '2 of clubs not removed from hand');
    });
  });

  describe('secondPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: 'clubs', face: 2 }).game;
    });

    it('wrongPlayer', () => {
      // it is player 1's turn
      const result = play(0, game, { suit: 'clubs', face: 9 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_WRONG_PLAYER);
    });

    it('unownedCard', () => {
      // player 1 doesn't have the 9 of clubs
      const result = play(1, game, { suit: 'clubs', face: 9 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_UNOWNED_CARD);
    });

    it('notFollowingSuit', () => {
      // player 1 must follow clubs as they have the 4, 10 & Q of clubs
      const result = play(1, game, { suit: 'diamonds', face: 13 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('validPlay', () => {
      // player 1 can play either the 4, 10 or Q of clubs
      const result = play(1, game, { suit: 'clubs', face: 12 });
      assert.isTrue(result.success, 'Q of clubs was not valid');
    });
  });

  describe('thirdPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: 'clubs', face: 2 }).game;
      game = play(1, game, { suit: 'clubs', face: 12 }).game;
    });

    it('pointOnFirst_qOfSpades', () => {
      // player 2 has no clubs and has the queen of spades and no clubs, but can't play due to rules
      const result = play(2, game, { suit: 'spades', face: 12 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('pointOnFirst_heart', () => {
      // player 2 also has the 7 of hearts, but can't play due to rules
      const result = play(2, game, { suit: 'hearts', face: 7 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('validPlay', () => {
      // player 2 will play the ace of diamonds as they have no clubs
      const result = play(2, game, { suit: 'diamonds', face: 14 });
      assert.isTrue(result.success, 'A of diamonds was not valid');
    });
  });

  describe('finalPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: 'clubs', face: 2 }).game;
      game = play(1, game, { suit: 'clubs', face: 12 }).game;
      game = play(2, game, { suit: 'diamonds', face: 14 }).game;
    });

    it('finishingTrick', () => {
      // the final play of the 6 of clubs should finish the trick
      const result = play(3, game, { suit: 'clubs', face: 6 });
      assert.equal(result.game.tricks.length, 2, 'New trick not started');
    });

    it('winningTrick', () => {
      // the A of diamonds is the highest card played, but should not win (Q of clubs should)
      const result = play(3, game, { suit: 'clubs', face: 6 });
      assert.equal(result.game.tricks[0].winner, 1, 'Q of clubs did not win');
      assert.equal(result.game.tricks[1].next, 1, 'Winner did not have next lead');
    });
  });

  describe('secondTrick', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: 'clubs', face: 2 }).game;
      game = play(1, game, { suit: 'clubs', face: 12 }).game;
      game = play(2, game, { suit: 'diamonds', face: 14 }).game;
      game = play(3, game, { suit: 'clubs', face: 6 }).game;
    });

    it('leadingHearts_whenNotBroken', () => {
      // player 1 has the lead, but no hearts broken and has other cards
      const result = play(1, game, { suit: 'hearts', face: 11 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('leadingQueenOfSpades', () => {
      // player 1 has the Queen of spades, and is OK to lead it now
      const result = play(1, game, { suit: 'spades', face: 12 });
      assert.isTrue(result.success, 'Q of spades could not be lead');
    });
  });
});
