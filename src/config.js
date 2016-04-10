const Hapi = require('hapi');

const server = new Hapi.Server();
server.connection({ port: 3000 });

server.route({
  method: 'GET',
  path: '/',
  handler: (request, reply) => {
    reply('Hello, World!');
  },
});

server.route({
  method: 'GET',
  path: '/{name}',
  handler: (request, reply) => {
    reply(`Hello, ${encodeURIComponent(request.params.name)}!`);
  },
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('Server running at:', server.info.uri);
});
