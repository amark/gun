console.log("If module not found, install hapi globally `npm i hapi inert -g`!");

const Hapi  = require('hapi')
const Inert = require('inert')
// const Gun   = require('..')

const server = new Hapi.Server({
  port: 8080,
  host: 'localhost',
  routes: {
    files: {
      relativeTo: require('path').join(__dirname, '..')
    }
  }
})

// server.connections.forEach(c => Gun({ web: c.listener, file: 'data.json' }))

async function runtime() {

  await server.register(Inert);

  server.route({
    method: 'GET',
    path: '/gun.js',
    handler: {
      file:  'gun.min.js'
    }
  })

  server.route({
    method: 'GET',
    path: '/gun/nts.js',
    handler: {
      file:  'nts.js'
    }
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

  await server.start();
  console.log('Server running at:', server.info.uri, 'dir:', __dirname)
}

runtime()
