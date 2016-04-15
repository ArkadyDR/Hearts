import Joi from 'joi';
import Boom from 'boom';
import { startRound, play } from '../game/hearts';

let game = startRound([0, 0, 0, 0]);

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
        const hand = game.hands[request.params.pid];
        reply({ pid: request.params.pid, hand });
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
        reply(game.tricks);
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
        const result = play(pid, game, card);

        if (!result.success) {
          const err = Boom.badRequest(result.message, { reason: result.reason });
          err.output.payload.details = err.data;
          reply(err);
        } else if (game.winner) {
          reply(`Play succeeded. Game complete. Winner was pid ${game.winner}.`);
          game = startRound([0, 0, 0, 0]);
        } else {
          game = result.game;
          reply('Play succeeded. Game continues.');
        }
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
        reply(game.scores);
      },
    },
  });
}