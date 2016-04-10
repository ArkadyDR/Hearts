import Boom from 'boom';
import Lodash from 'lodash';

export default class HeartsGame {
  constructor() {
    this.startFirstTrick();
  }

  deal() {
    // create deck
    const deck = [];
    for (const suit of ['hearts', 'diamonds', 'clubs', 'spades']) {
      for (let face = 1; face <= 13; face++) {
        deck.push({
          suit,
          face,
        });
      }
    }

    const shuffledDeck = Lodash.shuffle(deck);

    // deal into 4 hands
    const hands = [[], [], [], []];

    for (let i = 0; i < shuffledDeck.length; i++) {
      hands[i % hands.length].push(shuffledDeck[i]);
    }

    return hands;
  }

  getHand(pid) {
    return this.hands[pid];
  }

  getScores() {
    return this.scores;
  }

  getTricks() {
    return this.tricks;
  }

  play(pid, card) {
    if (!this.validatePlayerIsNext(pid)) {
      return Boom.badRequest(
        `It is not player ${pid}'s turn`
      );
    }
    if (!this.validatePlayerHasCard(pid, card)) {
      return Boom.badRequest(
        `Player ${pid} doesn't have the ${card.face} of ${card.suit}`
      );
    }
    if (!this.validateCardIsLegal(pid, card)) {
      return Boom.badRequest(
        `The ${card.face} of ${card.suit} is not a legal play for player ${pid}`
      );
    }

    const currentTrick = this.tricks[this.tid];
    currentTrick.cards.push({
      suit: card.suit,
      face: card.face,
      pid,
    });

    // remove the played card from the player's hand
    this.hands[pid] = Lodash.reject(this.hands[pid], (c) =>
      c.suit === card.suit && c.face === card.face
    );

    // advance the player
    currentTrick.next++;
    if (currentTrick.next > this.hands.length) {
      currentTrick.next = 0;
    }

    // all players have played
    if (currentTrick.cards.length === this.hands.length) {
      // determine winning player
      currentTrick.winner = this.determineCurrentTrickWinner();
      delete currentTrick.next;

      if (Lodash.some(this.hands, (hand) => hand.length === 0)) {
        this.scoreRound();

        // only continue if someone hasn't breached 50 points yet
        if (!Lodash.some(this.scores, score => score > 50)) {
          this.startFirstTrick();
        }
      } else {
        this.startNextTrick();
      }
    }

    return null;
  }

  startFirstTrick() {
    this.tricks = [];
    this.heartsBroken = false;
    this.hands = this.deal();
    this.tid = 0;
    this.scores = [0, 0, 0, 0];

    this.tricks[this.tid] = {
      // lead is the player with the two of clubs
      next: Lodash.findIndex(this.hands, (hand) => Lodash.some(hand, { suit: 'clubs', face: 2 })),
      cards: [],
      winner: undefined,
    };
  }

  startNextTrick() {
    this.tid++;

    this.tricks[this.tid] = {
      // lead is the winner of the previous trick
      next: this.tricks[this.tid - 1].winner,
      cards: [],
      winner: undefined,
    };
  }

  validatePlayerHasCard(pid, card) {
    const hand = this.hands[pid];
    return Lodash.some(hand, card);
  }

  validatePlayerIsNext(pid) {
    const currentTrick = this.tricks[this.tid];
    return pid === currentTrick.next;
  }

  determineCurrentTrickWinner() {
    // Rules are:
    //
    // 1. Highest card of lead suit wins

    const currentTrick = this.tricks[this.tid];
    const leadSuit = currentTrick.cards[0].suit;

    const winningCard = Lodash.maxBy(currentTrick.cards, (card) =>
      (card.suit === leadSuit ? card.face : 0)
    );

    return winningCard.pid;
  }

  scoreRound() {
    // Rules are:
    //
    // 1. Heart card = 1 point
    // 2. Queen of spades = 13 points
    // UNLESS
    // 3. Player has all hearts + Queen of Spades, then = 0 and all others 26

    const cards = Lodash.flatten(this.tricks);
    const scores = [0, 0, 0, 0];

    for (let i = 0; i < this.hands.length; i++) {
      const playerCards = Lodash.filter(cards, (card) => i === card.pid);
      const playerScore = Lodash.sumBy(playerCards, (card) => {
        if (card.suit === 'hearts') {
          return 1;
        } else if (card.suit === 'spades' && card.face === 12) {
          return 13;
        }
        return 0;
      });

      scores[i] = playerScore;
    }

    // work out if someone shot the moon, if so then everyone else gets 26 and they get 0
    if (Lodash.some(scores, 26)) {
      for (let i = 0; i < this.hands.length; i++) {
        scores[i] = 26 - scores[i];
      }
    }

    // add the scores to the running tally
    for (let i = 0; i < this.hands.length; i++) {
      this.scores[i] += scores[i];
    }
  }

  validateCardIsLegal(pid, card) {
    // Rules are:
    //
    // 1. Can't lead a heart if this.heartsBroken === false unless no other choice
    // 2. If not leading, must follow suit unless no cards of suit in hand
    // 3. If first trick, must lead 2 of clubs
    // 4. If first trick, cannot play a point card unless no other choice

    const currentTrick = this.tricks[this.tid];

    // first trick, player has the lead
    if (this.tid === 0 && currentTrick.cards.length === 0) {
      // must play 2 of clubs
      if (card.suit !== 'clubs' || card.face !== 2) {
        return false;
      }
    }

    // first trick, player does not have the lead
    if (this.tid === 0 && currentTrick.cards.length > 0) {
      // must not play point card unless no other option
      if (card.suit === 'hearts' ||
        (card.suit === 'spades' && card.face === 12) && this.validatePlayerHasNonPointCard(pid)) {
        return false;
      }
    }

    // not the first trick, player has the lead
    if (this.tid > 0 && currentTrick.cards.length === 0) {
      // must not play heart if hearts not broken
      if (!this.heartsBroken && !this.validatePlayerHasNoHearts(pid)) {
        // can't play any Hearts (point card)
        if (card.suit === 'hearts') {
          return false;
        }
      }
    }

    // player does not have the lead
    if (currentTrick.cards.length > 0) {
      const firstCard = currentTrick.cards[0];

      // must follow suit if possible
      if (card.suit !== firstCard.suit && this.validatePlayerHasSuit(pid, firstCard.suit)) {
        return false;
      }
    }

    return true;
  }

  validatePlayerHasSuit(pid, suit) {
    const hand = this.hands[pid];
    return Lodash.some(hand, (card) => card.suit === suit);
  }

  validatePlayerHasNonPointCard(pid) {
    const hand = this.hands[pid];
    return Lodash.some(hand, (card) =>
      card.suit !== 'hearts' && (card.suit !== 'spades' && card.face !== 12)
    );
  }

  validatePlayerHasNoHearts(pid) {
    const hand = this.hands[pid];
    return Lodash.some(hand, (card) => card.suit !== 'hearts');
  }
}
