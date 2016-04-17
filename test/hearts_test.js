import { assert } from 'chai';
import Lodash from 'lodash';
import fs from 'fs';

import {
  play,
  INVALID_ILLEGAL_PLAY,
  INVALID_UNOWNED_CARD,
  INVALID_WRONG_PLAYER,
  HEARTS,
  DIAMONDS,
  CLUBS,
  SPADES,
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
      const result = play(1, game, { suit: CLUBS, face: 4 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_WRONG_PLAYER);
    });

    it('not2ofClubs', () => {
      // player 0 has the 9 of clubs, but is required to play the 2
      const result = play(0, game, { suit: CLUBS, face: 9 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('2ofClubs', () => {
      // this is the only valid initial play
      const result = play(0, game, { suit: CLUBS, face: 2 });
      assert.isTrue(result.success, '2 of clubs was not valid');

      const hand = result.game.hands[0];
      assert.equal(hand.length, 12, 'card not removed from hand');
      assert.isFalse(Lodash.some(hand, card => card.suit === CLUBS && card.face === 2),
        '2 of clubs not removed from hand');
    });
  });

  describe('secondPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
    });

    it('wrongPlayer', () => {
      // it is player 1's turn
      const result = play(0, game, { suit: CLUBS, face: 9 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_WRONG_PLAYER);
    });

    it('unownedCard', () => {
      // player 1 doesn't have the 9 of clubs
      const result = play(1, game, { suit: CLUBS, face: 9 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_UNOWNED_CARD);
    });

    it('notFollowingSuit', () => {
      // player 1 must follow clubs as they have clubs
      const result = play(1, game, { suit: DIAMONDS, face: 13 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('validPlay', () => {
      // player 1 can play either any of their clubs
      const result = play(1, game, { suit: CLUBS, face: 12 });
      assert.isTrue(result.success, 'Q of clubs was not valid');
    });
  });

  describe('thirdPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
    });

    it('pointOnFirst_qOfSpades', () => {
      // player 2 has no clubs and has the queen of spades, but can't play due to rules
      const result = play(2, game, { suit: SPADES, face: 12 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('pointOnFirst_heart', () => {
      // player 2 also has the 7 of hearts, but can't play due to rules
      const result = play(2, game, { suit: HEARTS, face: 7 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('validPlay', () => {
      // player 2 will play the ace of diamonds as they have no clubs
      const result = play(2, game, { suit: DIAMONDS, face: 14 });
      assert.isTrue(result.success, 'A of diamonds was not valid');
    });
  });

  describe('finalPlay', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 14 }).game;
    });

    it('finishingTrick', () => {
      // the final play of the 6 of clubs should finish the trick
      const result = play(3, game, { suit: CLUBS, face: 6 });
      assert.equal(result.game.tricks.length, 2, 'New trick not started');
    });

    it('winningTrick', () => {
      // the A of diamonds is the highest card played, but should not win (Q of clubs should)
      const result = play(3, game, { suit: CLUBS, face: 6 });
      assert.equal(result.game.tricks[0].winner, 1, 'Q of clubs did not win');
      assert.equal(result.game.tricks[1].next, 1, 'Winner did not have next lead');
    });
  });

  describe('secondTrick', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 14 }).game;
      game = play(3, game, { suit: CLUBS, face: 6 }).game;
    });

    it('cardAlreadyPlayed', () => {
      // player 1 already played the 12 of clubs in the first trick, cannot lead it now
      const result = play(1, game, { suit: CLUBS, face: 12 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_UNOWNED_CARD);
    });

    it('leading_hearts_whenNotBroken', () => {
      // player 1 has the lead, but no hearts broken and has other cards
      const result = play(1, game, { suit: HEARTS, face: 11 });
      assert.isFalse(result.success);
      assert.equal(result.reason, INVALID_ILLEGAL_PLAY);
    });

    it('leading_nonClubSuit', () => {
      // player 1 can lead a non-clubs non-heart suit
      const result = play(1, game, { suit: DIAMONDS, face: 4 });
      assert.isTrue(result.success, '4 of diamonds could not be lead');
    });
  });

  describe('thirdTrick', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();

      // First Trick
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 14 }).game;
      game = play(3, game, { suit: CLUBS, face: 6 }).game;

      // Second Trick
      game = play(1, game, { suit: DIAMONDS, face: 4 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 9 }).game;
      game = play(3, game, { suit: DIAMONDS, face: 2 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 7 }).game;
    });

    it('leading_qOfSpades', () => {
      // player 2 has the Queen of spades, and is OK to lead it now
      const result = play(2, game, { suit: SPADES, face: 12 });
      assert.isTrue(result.success, 'Q of spades could not be lead');
    });

    it('breakingHearts', () => {
      game = play(2, game, { suit: DIAMONDS, face: 10 }).game;

      // player 3 was voided in diamonds in the previous round, so is free to play a heart now
      const result = play(3, game, { suit: HEARTS, face: 10 });
      assert.isTrue(result.success, '10 of hearts could not be played');
    });
  });

  describe('fourthTrick', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();

      // First Trick
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 14 }).game;
      game = play(3, game, { suit: CLUBS, face: 6 }).game;

      // Second Trick
      game = play(1, game, { suit: DIAMONDS, face: 4 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 9 }).game;
      game = play(3, game, { suit: DIAMONDS, face: 2 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 7 }).game;

      // Third Trick
      game = play(2, game, { suit: DIAMONDS, face: 10 }).game;
      game = play(3, game, { suit: HEARTS, face: 10 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 11 }).game;
      game = play(1, game, { suit: DIAMONDS, face: 6 }).game;
    });

    it('leadingHearts_whenBroken', () => {
      // as hearts was broken in the previous trick, it can be lead now
      const result = play(0, game, { suit: HEARTS, face: 3 });
      assert.isTrue(result.success, '3 of hearts could not be lead');
    });
  });

  describe('fifthTrick', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();

      // NOTE
      // History has changed a bit here, player 3 now didn't drop a heart on trick 3

      // First Trick
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 14 }).game;
      game = play(3, game, { suit: CLUBS, face: 6 }).game;

      // Second Trick
      game = play(1, game, { suit: DIAMONDS, face: 4 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 9 }).game;
      game = play(3, game, { suit: DIAMONDS, face: 2 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 7 }).game;

      // Third Trick
      game = play(2, game, { suit: DIAMONDS, face: 10 }).game;
      game = play(3, game, { suit: SPADES, face: 14 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 11 }).game;
      game = play(1, game, { suit: DIAMONDS, face: 6 }).game;

      // Fourth Trick
      game = play(0, game, { suit: CLUBS, face: 9 }).game;
      game = play(1, game, { suit: CLUBS, face: 7 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 8 }).game;
      game = play(3, game, { suit: CLUBS, face: 8 }).game;
    });

    it('leadingHearts_noOtherChoice', () => {
      // hearts has not been broken, but player 0 now has nothing but hearts
      const result = play(0, game, { suit: HEARTS, face: 3 });
      assert.isTrue(result.success, '3 of hearts could not be lead');
    });
  });

  describe('lastTrick', () => {
    let game = undefined;

    beforeEach(() => {
      game = loadInitialGame();

      // First Trick
      game = play(0, game, { suit: CLUBS, face: 2 }).game;
      game = play(1, game, { suit: CLUBS, face: 12 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 14 }).game;
      game = play(3, game, { suit: CLUBS, face: 6 }).game;

      // Second Trick
      game = play(1, game, { suit: DIAMONDS, face: 4 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 9 }).game;
      game = play(3, game, { suit: DIAMONDS, face: 2 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 7 }).game;

      // Third Trick
      game = play(2, game, { suit: DIAMONDS, face: 10 }).game;
      game = play(3, game, { suit: SPADES, face: 14 }).game;
      game = play(0, game, { suit: DIAMONDS, face: 11 }).game;
      game = play(1, game, { suit: DIAMONDS, face: 6 }).game;

      // Fourth Trick
      game = play(0, game, { suit: CLUBS, face: 9 }).game;
      game = play(1, game, { suit: CLUBS, face: 7 }).game;
      game = play(2, game, { suit: DIAMONDS, face: 8 }).game;
      game = play(3, game, { suit: CLUBS, face: 8 }).game;

      // Fifth Trick
      game = play(0, game, { suit: HEARTS, face: 14 }).game;
      game = play(1, game, { suit: HEARTS, face: 11 }).game;
      game = play(2, game, { suit: HEARTS, face: 7 }).game;
      game = play(3, game, { suit: HEARTS, face: 10 }).game;

      // Sixth Trick
      game = play(0, game, { suit: HEARTS, face: 13 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, { suit: HEARTS, face: 2 }).game;
      game = play(3, game, game.hands[3][0]).game;

      // Seventh Trick
      game = play(0, game, { suit: HEARTS, face: 12 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;

      // Eigth Trick
      game = play(0, game, { suit: HEARTS, face: 9 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;

      // Ninth Trick
      game = play(0, game, { suit: HEARTS, face: 8 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;

      // Tenth Trick
      game = play(0, game, { suit: HEARTS, face: 6 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;

      // Eleventh Trick
      game = play(0, game, { suit: HEARTS, face: 5 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;

      // Twelfth Trick
      game = play(0, game, { suit: HEARTS, face: 4 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;

      // Thirteenth Trick
      game = play(0, game, { suit: HEARTS, face: 3 }).game;
      game = play(1, game, game.hands[1][0]).game;
      game = play(2, game, game.hands[2][0]).game;
      game = play(3, game, game.hands[3][0]).game;
    });

    it('winning_shotTheMoon', () => {
      assert.equal(game.winner, 0);
      assert.equal(game.scores[0], 0);
      assert.equal(game.scores[0], 28);
      assert.equal(game.scores[0], 46);
      assert.equal(game.scores[0], 56);
    });
  });
});
