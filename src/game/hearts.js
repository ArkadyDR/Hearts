import Lodash from 'lodash';

export const INVALID_WRONG_PLAYER = 'INVALID_WRONG_PLAYER';
export const INVALID_UNOWNED_CARD = 'INVALID_UNOWNED_CARD';
export const INVALID_ILLEGAL_PLAY = 'INVALID_ILLEGAL_PLAY';

export const HEARTS = 'hearts';
export const DIAMONDS = 'diamonds';
export const CLUBS = 'clubs';
export const SPADES = 'spades';

/*
game: {
  hands: [
    card: {
      face: integer,
      suit: string,
    }
  ]
  scores: [
    integer
  ]
  tricks: [
    trick: {
      cards: [
        card: {
          face: integer,
          suit: string,
          player: integer,
        }
      ]
      next: integer OR winner: integer,
    },
  ]
  winner: integer,
}
*/

// needed to check if following lead suit is forced
export function validateHandContainsSuit(hand, suit) {
  return Lodash.some(hand, (card) => card.suit === suit);
}

export function validateHandContainsSuitOtherThan(hand, suit) {
  return Lodash.some(hand, (card) => card.suit !== suit);
}

export function validateCardIsPointCard(card) {
  return card.suit === HEARTS || (card.face === 12 && card.suit === SPADES);
}

// needed to check if hand can play something other than a point card
export function validateHandContainsNonPointCard(hand) {
  return Lodash.some(hand, (card) => !validateCardIsPointCard(card));
}

export function validateHandContainsCard(hand, card) {
  return Lodash.some(hand, card);
}

export function validatePlayerIsNext(pid, game) {
  return pid === game.tricks[game.tricks.length - 1].next;
}

export function validateHeartsIsBroken(tricks) {
  return Lodash.some(tricks, trick => Lodash.some(trick.cards, card => card.suit === HEARTS));
}

export function validateRoundIsFinished(tricks) {
  return tricks.length === 13 && tricks[12].winner !== undefined;
}

export function validateGameIsFinished(scores) {
  return Lodash.some(scores, score => score > 50);
}

export function validateCardIsLegal(hand, tricks, card) {
  // Rules are:
  //
  // 1. Can't lead a heart if hearts not broken unless no other choice
  // 2. If not leading, must follow suit unless no cards of suit in hand
  // 3. If first trick, must lead 2 of clubs
  // 4. If first trick, cannot play a point card unless no other choice

  const trick = tricks[tricks.length - 1];

  // first trick, player has the lead
  if (tricks.length === 1 && trick.cards.length === 0) {
    // must play 2 of clubs
    if (card.suit !== CLUBS || card.face !== 2) {
      return false;
    }
  }

  // first trick, player does not have the lead
  if (tricks.length === 1 && trick.cards.length > 0) {
    // must not play point card unless no other option
    if (validateCardIsPointCard(card) && validateHandContainsNonPointCard(hand)) {
      return false;
    }
  }

  // not the first trick, player has the lead
  if (tricks.length > 0 && trick.cards.length === 0) {
    // must not play heart if hearts not broken
    if (card.suit === HEARTS && !validateHeartsIsBroken(tricks)
      && validateHandContainsSuitOtherThan(hand, HEARTS)) {
      return false;
    }
  }

  // all tricks, player does not have the lead
  if (trick.cards.length > 0) {
    const leadSuit = trick.cards[0].suit;

    // must follow suit if possible
    if (card.suit !== leadSuit && validateHandContainsSuit(hand, leadSuit)) {
      return false;
    }
  }

  return true;
}

function dealHands() {
  // create initial ordered deck
  let deck = [];
  for (const suit of [HEARTS, DIAMONDS, CLUBS, SPADES]) {
    for (let face = 2; face <= 14; face++) {
      deck.push({
        suit,
        face,
      });
    }
  }

  // shuffle the deck
  deck = Lodash.shuffle(deck);

  // deal into 4 hands
  let hands = [deck.slice(0, 13), deck.slice(13, 26), deck.slice(26, 39), deck.slice(39, 52)];

  // sort cards in order by suit
  hands = hands.map(hand => Lodash.sortBy(hand, ['suit', 'face']));

  return hands;
}

function finishTrick(trick) {
  // Rules are:
  //
  // 1. Highest card of lead suit wins

  const winningCard = Lodash.maxBy(trick.cards, (card) =>
    (card.suit === trick.cards[0].suit ? card.face : 0)
  );

  return {
    cards: trick.cards,
    winner: winningCard.player,
  };
}

function finishRound(tricks) {
  // Rules are:
  //
  // 1. Heart card = 1 point
  // 2. Queen of spades = 13 points
  // UNLESS
  // 3. Player has all hearts + Queen of Spades, then = 0 and all others 26

  const scores = [0, 0, 0, 0];

  for (let idx = 0; idx < 4; idx++) {
    const cards = Lodash.flatMap(
      Lodash.filter(tricks, trick => trick.winner === idx), trick => trick.cards);
    const score = Lodash.sumBy(cards, card => {
      if (card.suit === HEARTS) {
        return 1;
      } else if (card.suit === SPADES && card.face === 12) {
        return 13;
      }
      return 0;
    });

    scores[idx] = score;
  }

  // work out if someone shot the moon, if so then everyone else gets 26 and they get 0
  if (Lodash.some(scores, score => score === 26)) {
    for (let idx = 0; idx < 4; idx++) {
      scores[idx] = 26 - scores[idx];
    }
  }

  return scores;
}

function finishGame(scores) {
  return Lodash.indexOf(scores, Lodash.min(scores));
}

export function startRound(scores = [0, 0, 0, 0]) {
  const hands = dealHands();
  const lead = Lodash.findIndex(hands, (hand) => Lodash.some(hand, { suit: CLUBS, face: 2 }));

  return {
    scores,
    hands,
    tricks: [{ cards: [], next: lead }],
  };
}

function playCard(hand, tricks, card) {
  const trick = tricks[tricks.length - 1];

  if (!validateHandContainsCard(hand, card)) {
    return {
      tricks,
      success: false,
      reason: INVALID_UNOWNED_CARD,
      message: `Player ${trick.next} doesn't have the ${card.face} of ${card.suit}`,
    };
  }

  if (!validateCardIsLegal(hand, tricks, card)) {
    return {
      tricks,
      success: false,
      reason: INVALID_ILLEGAL_PLAY,
      message: `The ${card.face} of ${card.suit} is not a legal play`,
    };
  }

  trick.cards.push({
    suit: card.suit,
    face: card.face,
    player: trick.next,
  });

  if (trick.cards.length < 4) {
    // advance the player
    trick.next++;
    if (trick.next > 3) {
      trick.next = 0;
    }

    return {
      tricks,
      success: true,
    };
  }

  const finishedTrick = finishTrick(trick);
  const updatedTrickList = [
    ...tricks.slice(0, tricks.length - 1),
    finishedTrick
  ];

  if (updatedTrickList.length < 13) {
    updatedTrickList.push({ cards: [], next: finishedTrick.winner });
  }

  return {
    tricks: updatedTrickList,
    success: true,
  };
}

export function play(pid, game, card) {
  if (!validatePlayerIsNext(pid, game)) {
    // PROBLEM
    // It isn't this players turn. Return game state unchanged with failure details.
    return {
      game,
      success: false,
      reason: INVALID_WRONG_PLAYER,
      message: `Player ${pid} is not next`,
    };
  }

  const { tricks, success, reason, message } = playCard(game.hands[pid], game.tricks, card);

  if (!success) {
    // PROBLEM
    // The selected card was not a legal play. Return game state unchanged with failure details.
    return {
      game,
      success,
      reason,
      message,
    };
  }

  if (validateRoundIsFinished(tricks)) {
    const scores = finishRound(tricks);

    for (let idx = 0; idx < 4; idx++) {
      scores[idx] += game.scores[idx];
    }

    if (validateGameIsFinished(scores)) {
      const winner = finishGame(scores);

      // GAME FINISHED
      // Return the game state, with the winner property added.
      return {
        game: {
          scores,
          tricks,
          winner,
        },
        success: true,
      };
    }

    const newRound = startRound();

    // ROUND FINISHED
    // Return the game state, with the scores updated and new hands/tricks generated.
    return {
      game: {
        ...newRound,
        scores,
      },
      success: true,
    };
  }

  // ROUND STILL IN PROGRESS
  // Return the game state, with the tricks updated, and the played card removed from the hand.
  return {
    game: {
      ...game,
      tricks,
      hands: game.hands.map(hand => Lodash.reject(hand, card)),
    },
    success: true,
  };
}
