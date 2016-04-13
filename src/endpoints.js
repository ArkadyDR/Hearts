const Joi = require('joi');
import HeartsGame from './hearts';

const game = new HeartsGame();

export default function configureEndpoints(server) {
  server.route({
    method: 'GET',
    path: '/game/hands/{pid}',
    config: {
      description: 'Get a player\'s current hand',
      tags: ['api', 'game'],

      validate: {
        params: {
          pid: Joi.number().integer().min(0).max(3).required().description('the player id'),
        },
      },

      handler: (request, reply) => {
        const hand = game.getHand(request.params.pid);
        reply({pid: request.params.pid, hand: hand});
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/game/tricks',
    config: {
      description: 'Get the list of tricks',
      tags: ['api', 'game'],

      validate: {
        params: {
        },
      },

      handler: (request, reply) => {
        const tricks = game.getTricks();
        reply(tricks);
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/game/play/{pid}',
    config: {
      description: 'Play a card',
      tags: ['api', 'game'],

      validate: {
        params: {
          pid: Joi.number().integer().min(0).max(3).required().description('the player id'),
        },
        payload: {
          suit: Joi.string().valid('hearts', 'diamonds', 'clubs', 'spades')
            .required().description('the card suit'),
          face: Joi.number().integer().min(2).max(14).required().description('the card face value'),
        },
      },

      handler: (request, reply) => {
        const pid = request.params.pid;
        const card = request.payload;
        const result = game.play(pid, card);
        reply(result);
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/game/scores',
    config: {
      description: 'Get the scores',
      tags: ['api', 'game'],

      handler: (request, reply) => {
        const scores = game.getScores();
        reply(scores);
      },
    },
  });
}
