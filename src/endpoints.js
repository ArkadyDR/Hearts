const Joi = require('joi');
import HeartsGame from './hearts';

const game = new HeartsGame();

export default function configureEndpoints(server) {
  server.route({
    method: 'GET',
    path: '/game/hands/{pid}',
    config: {
      description: 'Get a player\'s hand',
      notes: 'Gets a player\'s hand based on the game ID and player ID provided',
      tags: ['api', 'game'],

      validate: {
        params: {
          pid: Joi.number().integer().min(0).max(3).required().description('the player id'),
        },
      },

      handler: (request, reply) => {
        const hand = game.getHand(request.params.pid);
        reply(hand);
      },
    },
  });

  server.route({
    method: 'GET',
    path: '/game/tricks',
    config: {
      tags: ['api', 'game'],

      validate: {
        params: {
        },
      },

      handler: (request, reply) => {
        // TODO: this needs to be an access method?
        const tricks = game.tricks;
        reply(tricks);
      },
    },
  });

  server.route({
    method: 'POST',
    path: '/game/play/{pid}',
    config: {
      tags: ['api', 'game'],

      validate: {
        params: {
          pid: Joi.number().integer().min(0).max(3).required().description('the player id'),
        },
        payload: {
          suit: Joi.string().required().description('the card suit'),
          face: Joi.number().integer().min(1).max(13).required().description('the card face value'),
        },
      },

      handler: (request, reply) => {
        const pid = request.params.pid;
        // TODO: Validate that this is a real card
        const card = request.payload;
        const result = game.play(pid, card);
        reply(result);
      },
    },
  });

  // Routes TODO
  /*
    scoring
    multiple games in parallel
    better error handling
  */
}
