var config = {
	IP: require('ip').address(),
	port: 8765,
	servers: 4,
	browsers: 0,
	route: {
		'/': __dirname + '/index.html',
		'/gun.js': __dirname + '/../../gun.js',
		'/jquery.js': __dirname + '/../../examples/jquery.js'
	},
	names:['alice','bob'],
	keys:{
		PROFILE:'Profile',
		DISPLAY_NAME:'displayName',
		CURRENT_HANDSHAKE_ADDRESS:'currentHandshakeAddress',
		HANDSHAKE_NODES:'handshakeNodes',
		CURRENT_ORDER_ADDRESS:'currentOrderAddress',
		BIO:'bio',
		USER_TO_INCOMING:'userToIncoming',
		RECIPIENT_TO_OUTGOING:'recipientToOutgoing',
		USER_TO_LAST_REQUEST_SENT:'USER_TO_LAST_REQUEST_SENT',
		OUTGOINGS:'outgoings',
		MESSAGES:'messages',

	}
}
var testData = Array(config.servers-2).fill()
const rands = length => {
	var result           = '';
	var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	var charactersLength = characters.length;
	for ( var i = 0; i < length; i++ ) {
	   result += characters.charAt(Math.floor(Math.random() * charactersLength));
	}
	return result;
 }

var panic = require('panic-server');
panic.server().on('request', function(req, res){
	config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port);

var clients = panic.clients;
var manager = require('panic-manager')();

manager.start({
    clients: Array(config.servers).fill().map(function(u, i){
			return {
				type: 'node',
				port: config.port + (i + 1)
			}
    }),
    panic: 'http://' + config.IP + ':' + config.port
});

var servers = clients.filter('Node.js');
var server = servers.pluck(1);
var spawn = servers.excluding(server).pluck(1);
var serverClients = servers.excluding(new panic.ClientList([server, spawn]))
//var browsers = clients.excluding(servers);
var alice = serverClients.pluck(1);
var bob = serverClients.excluding(alice).pluck(1);
var again = {};

describe("Shocknet Test!", function(){
	//this.timeout(5 * 60 * 1000);
	this.timeout(10 * 60 * 1000);

	it("Servers have joined!", function(){
		return servers.atLeast(config.servers);
	});

	it("GUN started!", function(){
		return server.run(function(test){
			var env = test.props;
			test.async();
			try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
			try{ require('fs').unlinkSync((env.i+1)+'data') }catch(e){}
			try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
			try{ require('gun/lib/fsrm')((env.i+1)+'data') }catch(e){}
			var port = env.config.port + env.i;
			var server = require('http').createServer(function(req, res){
				res.end("I am "+ env.i +"!");
			});
			var Gun = require('gun');
			var gun = Gun({file: env.i+'data', web: server});
			server.listen(port, function(){
				test.done();
			});
		}, {i: 1, config: config}); 
	});

	it("Server Clients initialized gun!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(function(test){
				//localStorage.clear();
				global.rands = length => {
					var result           = '';
					var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
					var charactersLength = characters.length;
					for ( var i = 0; i < length; i++ ) {
					   result += characters.charAt(Math.floor(Math.random() * charactersLength));
					}
					return result;
				}
				var env = test.props;
				try{ require('fs').unlinkSync(env.i+'data') }catch(e){}
				try{ require('fs').unlinkSync((env.i+1)+'data') }catch(e){}
				try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
				try{ require('gun/lib/fsrm')((env.i+1)+'data') }catch(e){}
				var Gun = require('gun');
				var gun = Gun('http://'+ env.config.IP + ':' + (env.config.port + 1) + '/gun');
				global.gun = gun;
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Server Clients auth with gun!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(function(test){
				
				//localStorage.clear();
				var env = test.props;
				//try{ require('gun/lib/fsrm')(env.i+'data') }catch(e){}
				//try{ require('gun/lib/fsrm')((env.i+1)+'data') }catch(e){}
				const user = global.gun.user()
				const alias = env.config.names[env.i-1] + rands(4)
				const pass = rands(8)
				
				return new Promise((res,rej) => {
					user.create(alias,pass,ack => {
					
						if(ack.err){
							//test.fail(ack.err)
							rej(ack.err)
						} else {
							user.auth(alias,pass,ack1 =>{
								if(ack1.err){
									//test.fail(ack1.err)
									rej(ack1.err)
								} else {
									global.alias = alias
									global.pass = pass
									global.user = user
									console.log(env.i,alias,pass)
									res({i:env.i,pub:user.is.pub,alias:alias})
								}
							})
						}
					})
				})
			}, {i: i += 1, config: config}).then(res => {
				
				testData[res.i-1] = res
			})); 
		});
		return Promise.all(tests);
	});

	it("Server Clients generating SEA secret!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(async function(test){
				
				var env = test.props;
				const SEA = require('gun/sea')
				const user = global.user
				const mySecret = await SEA.secret(user._.sea.epub,user._.sea)
				global.SEA = SEA 
				global.mySecret = mySecret
				
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Server Clients set display name!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(function(test){
				//localStorage.clear();
				var env = test.props;
				var keys = env.config.keys
				global.user
					.get(keys.PROFILE)
					.get(keys.DISPLAY_NAME)
					.put(global.alias,ack =>{
						if(ack.err){
							test.fail(ack.err)
						}
					})
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Reading alice display name using .on !",function(){
		return bob.run(function(test){
			const {pub} = test.props
			const {keys} = test.props.config
			global.gun
				.user(pub)
				.get(keys.PROFILE)
				.get(keys.DISPLAY_NAME)
				.on(dn => {
					if(!dn.startsWith('alice')){
						test.fail(`display Name > ${dn}`)
					}
				})
		},{pub: testData[0].pub, config: config})
	})
	
	it("Reading bob display name using .once !",function(){
		return alice.run(function(test){
			const {pub} = test.props
			const {keys} = test.props.config
			global.gun
				.user(pub)
				.get(keys.PROFILE)
				.get(keys.DISPLAY_NAME)
				.once(dn => {
					if(!dn.startsWith('bob')){
						test.fail(`display Name > ${dn}`)
					}
				})
		},{pub: testData[1].pub, config: config})
	})

	it("Server Clients generate handshake node!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(function(test){
				//localStorage.clear();
				var env = test.props;
				var keys = env.config.keys
				var address = rands(24)
				global.user
					.get(keys.CURRENT_HANDSHAKE_ADDRESS)
					.put(address,ack =>{
						if(ack.err){
							test.fail(ack.err)
						} else {
							global.user
								.get(keys.HANDSHAKE_NODES)
								.get(address)
								.put({ unused: 0 },ack1 =>{
									if(ack.err){
										test.fail(ack.err)
									}
								})
						}
					})
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});
	it("Server Clients generate order address!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(function(test){
				//localStorage.clear();
				var env = test.props;
				var keys = env.config.keys
				var address = rands(24)
				global.user
					.get(keys.CURRENT_ORDER_ADDRESS)
					.put(address,ack => {
						if(ack.err){
							test.fail(ack.err)
						}
					})
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("Server Clients set bio!", function(){
		var tests = [], i = 0;
		serverClients.each(function(client, id){
			tests.push(client.run(function(test){
				//localStorage.clear();
				const env = test.props;
				const keys = env.config.keys
				const name = env.config.names[env.i-1]
				const bio = `Hi my name is ${name}`
				global.user
					.get(keys.BIO)
					.put(bio,ack => {
						if(ack.err){
							test.fail(ack.err)
						} else {
							global.user
								.get(keys.PROFILE)
								.get(keys.BIO)
								.put(bio,ack => {
									if(ack.err){
										test.fail(ack.err)
									}
								})
						}
					})
			}, {i: i += 1, config: config})); 
		});
		return Promise.all(tests);
	});

	it("All finished!", function(done){
		console.log("Done! Cleaning things up...");
		setTimeout(function(){
			done();
		},1000);
	});

	after("Everything shut down.", function(){
		return servers.run(function(){
			process.exit();
		});
	});
});