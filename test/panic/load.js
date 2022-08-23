var config = {
	IP: require('ip').address(),
	port: 8765,
	relays: 1,
	browsers: 4,
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
var panic; try{ panic = require('panic-server') } catch(e){ console.log("PANIC not installed! `npm install panic-server panic-manager panic-client`") }

panic.server().on('request', function(req, res){ // Static server
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port); // Start panic server.

// In order to tell the clients what to do,
// We need a way to reference all of them.
var clients = panic.clients;

// Some of the clients may be NodeJS relays on different machines.
// PANIC manager is a nifty tool that lets us remotely spawn them.
var manager = require('panic-manager')();
manager.start({
    clients: Array(config.relays).fill().map(function(u, i){ // Create a bunch of relays.
			return {
				type: 'node',
				port: config.port + (i + 1) // They'll need unique ports to start on, if we run the test on 1 machine.
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port // Auto-connect to our panic server.
});

// Now lets divide our PANIC clients into "relays" and "browsers".
var relays = clients.filter('Node.js');
var browsers = clients.excluding(relays);

// Sweet! Now we can start the tests.
// PANIC works with Mocha and other testing libraries!
// So it is easy to use PANIC.

describe("Load test "+ config.browsers +" browser(s) across "+ config.relays +" server(s)!", function(){

	// We'll have to manually launch the browsers,
	// So lets up the timeout so we have time to do that.
	this.timeout(5 * 60 * 1000);

	it("Relays have joined!", function(){
		// Alright, lets wait until enough gun server peers are connected.
		return relays.atLeast(config.relays);
	});

	it("GUN has spawned!", function(){
		// Once they are, we need to actually spin up the gun server.
		var tests = [], i = 0;
		relays.each(function(client){
			// for each server peer, tell it to run this code:
			tests.push(client.run(function(test){
				// NOTE: Despite the fact this LOOKS like we're in a closure...
				// it is not! This code is actually getting run
				// in a DIFFERENT machine or process!
				var env = test.props;
				// As a result, we have to manually pass it scope.
				test.async();
				// Clean up from previous test.
				try{ require('fs').unlinkSync(env.i+'data.json') }catch(e){}
				var server = require('http').createServer(function(req, res){
					res.end("I am "+ env.i +"!");
				});
				// Launch the server and start gun!
				var Gun; try{ Gun = require('gun') }catch(e){ console.log("GUN not found! You need to link GUN to PANIC. Nesting the `gun` repo inside a `node_modules` parent folder often fixes this.") }
				// Attach the server to gun.
				var gun = Gun({file: env.i+'data', web: server, localStorage: false});
				server.listen(env.config.port + env.i, function(){
					// This server peer is now done with the test!
					// It has successfully launched.
					test.done();
				});
			}, {i: i += 1, config: config})); 
		});
		// NOW, this is very important:
		// Do not proceed to the next test until
		// every single server (in different machines/processes)
		// have ALL successfully launched.
		return Promise.all(tests);
	});

	it(config.browsers +" browser(s) have joined!", function(){
		// Okay! Cool. Now we can move on to the next step...
		require('./util/open').web(config.browsers, "http://"+ config.IP +":"+ config.port);
		// Which is to automatically or manually open up a bunch of browser tabs
		// and connect to the PANIC server in the same way
		// the NodeJS relays did.

		// However! We're gonna cheat...
		browsers.atLeast(1).then(function(){
			// When there is at least one browser opened, tell it to run this code:
			browsers.run(function(test){
				// NOTE: This closure is now being run IN THE BROWSER.
				// This code is not server side code, despite the fact
				// that we've written it on the server. It is not.
				// Mind blowing, right?
				var env = test.props;
				// Like before, we had to manually pass it some scope.
				$('body').prepend("<button onclick='allopen()'>Open All Browsers</button>");
				// All right, lets cheat by making a button
				// that will automatically open all the
				// remaining browser tabs for us
				// so we don't have to do it manually.
				window.allopen = function(i){
					if(env.config.browsers <= i){ return }
					i = i || 1;
					var win = window.open(location, '_blank');
					win.focus();
					setTimeout(function(){allopen(i+1)},0);
				}
			}, {config: config});
		});
		// Cool! Once that is done...
		// WAIT until all those browser tabs
		// have connected to the PANIC server
		// THEN move onto the next step
		// where we will cause chaos!
		return browsers.atLeast(config.browsers);
	});

	it("Data was saved and synced across all browsers!", function(){
		// This is where it gets good!
		var tests = [], ids = {}, i = 0;
		// Let us create a list of all the browsers IDs connected.
		// This will later let each browser check against every other browser.
		browsers.each(function(client, id){
			ids[id] = 1;
		});
		browsers.each(function(client, id){
			// for every browser, run the following code:
			tests.push(client.run(function(test){
				//var audio = new Audio('https://www.nasa.gov/mp3/640170main_Roger%20Roll.mp3');audio.addEventListener('ended', function() {this.currentTime = 0;this.play();}, false);audio.play(); // testing if audio prevents Chrome throttle?
				localStorage.clear(); // Clean up anything from before.
				var env = test.props;
				// Get access to the "outer scope" which has the browser IDs
				// as well as other configuration information.
				test.async();
				// Now we want to connect to every gun server peer...
				var peers = [], i = env.config.relays;
				while(i--){
					// For the total number of relays listed in the configuration
					// Add their URL into an array.
					peers.push('http://'+ env.config.IP + ':' + (env.config.port + (i + 1)) + '/gun');
				}
				// Pass all the relays we want to connect to into gun.
				//var gun = Gun();
				var gun = Gun(peers);
				// Now we want to create a list
				// of all the messages that WILL be sent
				// according to the expected configuration.
				// This is equal to...
				var num = 0, total = 0, check = Gun.obj.map(env.ids, function(v,id,t){
					// for each browser ID
					// they will be saving X number of messages each.
					var i = env.config.each;
					while(i--){
						// So add a deterministic key we can check against.
						t(id + (i + 1), 1);
						// And count up the total number of messages we expect for all.
						total += 1;
					}
				});
				// Note, this `check` hash table now looks something like this:
				// {alice1: 1, alice2: 1, alice3: 1, bob1: 1, bob2: 1, bob3: 1}
				var report = $("<div>").css({position: 'fixed', top: 0, right: 0, background: 'white', padding: 10}).text(num +" / "+ total +" Verified").prependTo('body');
				// Add a nifty UI that tells us how many messages have been verified.
				// FINALLY, tell gun to subscribe to every record
				// that is is/will be saved to this table.
				gun.get('test').map().on(function(data, key){
					// When we get realtime updates to the data,
					// create or reuse a DIV that we
					//var el = $('#'+key).length ? $('#'+key) : $('<div>');
					// log the data out to, so we can visually see our test.
					//$(log).append(el.attr('id', key).text(key +": "+ data));
					$(log).text(key +": "+ data); // DOM updates thrash performance, try this.
					// Scroll down with the logging.
					//$('body').stop(true).animate({scrollTop: $(log).height()});
					// Now, make sure the received data
					// matches exactly the data we EXPECT
					if(("Hello world, "+key+"!") === data){
						// if it does, we can "check off" record
						// Bump the total number of verified items and update the UI.
						if(check[key]){ num += 1 }
						// from our verify todo list.
						check[key] = 0;
						report.text(num +" / "+ total +" Verified");
					}
					// This next part is important:
					if(Gun.obj.map(check, function(still){
						// IF THERE ARE ANY RECORDS STILL LEFT TO BE VERIFIED
						if(still){ return true }
					})){ return } // return, PREVENTING the test from being finished.
					// IF HOWEVER, every single message
					// that we EXPECTED to see
					// has now been seen
					// then THIS ONE BROWSER PEER (of many peers)
					// is finally done.
					test.done();
				});
				// But we have to actually tell the browser to save data!
				var i = 0, to = setInterval(function go(){
					// Cool, make a recursive function
					// that keeps going until we've saved each message.
					if(env.config.each <= i){
						clearTimeout(to);
						return;
					}
					//to = setTimeout(go, env.config.wait * Math.random()); // add a little jitter.
					i += 1;
					var p = env.id + i;
					// And actually save the data with gun,
					// as a record added to one big 'test' table.
					gun.get('test').get(p).put('Hello world, '+ p +'!');
				}, env.config.wait);
			}, {i: i += 1, id: id, ids: ids, config: config})); 
		});
		// YAY! We're finally done.
		// IF AND ONLY IF
		// EVERY SINGLE BROWSER
		// HAS VERIFIED
		// EVERY OTHER BROWSERS' data.
		// If they are ALL done, go to the next step.
		return Promise.all(tests);
	});

	after("Everything shut down.", function(){
		// which is to shut down all the browsers.
		require('./util/open').cleanup() || browsers.run(function(){
			setTimeout(function(){
				location.reload();
			}, 15 * 1000);
		});
		// And shut down all the relays.
		return relays.run(function(){
			process.exit();
		});
	});
})
// THE END!
// Congrats, wasn't that epic?
// Or still confused how a single 200 LOC test file
// Is running correctness verification tests
// across an entire distributed system of devices/browsers?
// Well, jump on https://gitter.im/amark/gun !

// Think adding tests like this to your work place would be bomb awesome?
// We totally sell PANIC training, licenses, and support!
// Please reach out to hi@gunDB.io if you are interested
// in purchasing consulting or services for PANIC.