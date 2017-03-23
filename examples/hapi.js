const Hapi  = require('hapi')
const Inert = require('inert')
const Gun   = require('..')

const server = new Hapi.Server
server.connection({ port: 8080 })
server.connections.forEach(c => Gun({ web: c.listener, file: 'data.json' }))

server.register(Inert, () => {});

server.route({
  method: 'GET',
  path: '/gun.js',
  handler: (request, reply) => reply.file('../gun.js', { confine: false })
})

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: __dirname,
      redirectToSlash: true,
      index: true
    }
  }
})

server.start()
