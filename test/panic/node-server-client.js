var config = {
    IP: require('ip').address(),
    port: 8765,
    servers: 2,
    browsers: 0,
    each: 1500,
    wait: 1,
    route: {
        '/': __dirname + '/index.html',
        '/gun.js': __dirname + '/../../gun.js',
        '/jquery.js': __dirname + '/../../examples/jquery.js'
    }
}

/*
	Welcome, person!
	You have found the test that causes gun to PANIC with load!
	Above are options to configure, the only ones useful are:
	 - browsers // number of browsers you want to load test across.
	 - each // the number of messages each browser should sync.
	This test is less than 200 lines of code (without comments)!
	However, if you aren't familiar with PANIC - you are in for a surprise!
	I'm Plublious, and I shall be your guide!
*/

// First we need to create a PANIC server.
// Each device/browser in the distributed system we are testing connects to it.
// It then coordinates these clients to cause chaos in the distributed system.
// Cool huh?
var panic;
try {
    panic = require('panic-server')
} catch (e) {
    console.log("PANIC not installed! `npm install panic-server panic-manager panic-client`")
}

panic.server().on('request', function (req, res) { // Static server
    config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port); // Start panic server.

// In order to tell the clients what to do,
// We need a way to reference all of them.
var clients = panic.clients;

// Some of the clients may be NodeJS servers on different machines.
// PANIC manager is a nifty tool that lets us remotely spawn them.
var manager = require('panic-manager')();
manager.start({
                  clients: Array(config.servers).fill().map(function (u, i) { // Create a bunch of servers.
                      return {
                          type: 'node',
                          port: config.port + (i + 1) // They'll need unique ports to start their servers on, if we run the test on 1 machine.
                      }
                  }),
                  panic: 'http://' + config.IP + ':' + config.port // Auto-connect to our panic server.
              });

// Now lets divide our clients into "servers" and "browsers".
var servers = clients.filter('Node.js');
var browsers = clients.excluding(servers);

// Sweet! Now we can start the tests.
// PANIC works with Mocha and other testing libraries!
// So it is easy to use PANIC.

describe("Load test " + config.browsers + " browser(s) across " + config.servers + " server(s)!",
         function () {
             this.timeout(60 * 1000);

             it("Servers have joined!", function () {
                 // Alright, lets wait until enough gun server peers are connected.
                 return servers.atLeast(config.servers);
             });

             it("GUN server has spawned!", function () {
                 var tests = [], i = 0;
                 var client = servers.get(Object.keys(servers.clients)[0]);
                 // for each server peer, tell it to run this code:
                 return client.run(function (test) {
                     // NOTE: Despite the fact this LOOKS like we're in a closure...
                     // it is not! This code is actually getting run
                     // in a DIFFERENT machine or process!
                     var env = test.props;
                     // As a result, we have to manually pass it scope.
                     test.async();
                     // Clean up from previous test.
                     try {
                         require('fs').unlinkSync(env.i + 'data.json')
                     } catch (e) {
                     }
                     var server = require('http').createServer(function (req, res) {
                         res.end("I am " + env.i + "!");
                     });
                     // Launch the server and start gun!
                     var Gun;
                     try {
                         Gun = require('gun')
                     } catch (e) {
                         console.log(
                             "GUN not found! You need to link GUN to PANIC. Nesting the `gun` repo inside a `node_modules` parent folder often fixes this.")
                     }
                     // Attach the server to gun.
                     var gun = Gun({file: false, web: server, localStorage: false, axe: false, radisk: false});
                     this.set('gun', gun)
                     server.listen(env.config.port + env.i, function () {
                         // This server peer is now done with the test!
                         // It has successfully launched.
                         test.done();
                     });
                 }, {i: i += 1, config: config});
             });

             it("GUN client has spawned!", function () {
                 var tests = [], i = 0;
                 var client = servers.get(Object.keys(servers.clients)[1]);
                 // for each server peer, tell it to run this code:
                 return client.run(function (test) {
                     // NOTE: Despite the fact this LOOKS like we're in a closure...
                     // it is not! This code is actually getting run
                     // in a DIFFERENT machine or process!
                     var env = test.props;
                     // As a result, we have to manually pass it scope.
                     test.async();
                     // Clean up from previous test.
                     try {
                         require('fs').unlinkSync(env.i + 'data.json')
                     } catch (e) {
                     }
                     var server = require('http').createServer(function (req, res) {
                         res.end("I am " + env.i + "!");
                     });
                     // Launch the server and start gun!
                     var Gun;
                     try {
                         Gun = require('gun')
                     } catch (e) {
                         console.log(
                             "GUN not found! You need to link GUN to PANIC. Nesting the `gun` repo inside a `node_modules` parent folder often fixes this.")
                     }
                     // Attach the server to gun.
                     var gun = Gun({
                                       file: false,
                                       localStorage: false,
                                       axe: false,
                                       peers: [`http://localhost:${env.config.port + env.i}`],
                                       radisk: false
                                   });
                     this.set('gun', gun)
                     test.done();
                 }, {i: i += 1, config: config});
             });

             it("Run tests", function () {
                 // This is where it gets good!
                 var tests = [], ids = {}, i = 0;

                 var client = servers.get(Object.keys(servers.clients)[1]);
                 var server = servers.get(Object.keys(servers.clients)[0]);
                 tests.push(server.run(function (test) {
                     test.async();
                     var gun = this.get('gun');
                     gun.get("a").get("abc").on(function (args) {
                         console.log(args);
                         test.done();
                     });
                 }));
                 tests.push(client.run(function (test) {
                     test.async();
                     var gun = this.get('gun');
                     gun.get("a").get("abc").put({
                                                     a: "b",
                                                     c: "d",
                                                     e: "e"
                                                 }, function (ack) {
                         if (ack.err) {
                             test.fail(ack.err);
                         }
                         test.done();
                     });
                 }));

                 return Promise.all(tests);
             });

             after("Everything shut down.", function () {
                 // And shut down all the servers.
                 return servers.run(function () {
                     process.exit();
                 });
             });
         })
