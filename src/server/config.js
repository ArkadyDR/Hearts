const Hapi = require('hapi');
const HapiSwagger = require('hapi-swagger');
const Inert = require('inert');
const Vision = require('vision');

import configureEndpoints from './endpoints';

const server = new Hapi.Server();
server.connection({
  host: '0.0.0.0',
  port: 3000,
  routes: {
    cors: true
  },
});

configureEndpoints(server);

server.register([
  Inert,
  Vision,
  {
    register: HapiSwagger,
    options: {
      info: {
        title: 'Hearts Server API Documentation',
        version: '0.0.1',
      },
    },
  },
], (err) => {
  if (err) {
    console.log('Hapi-Swagger Load Error ' + err);
  } else {
    console.log('Hapi-Swagger Loaded');
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
