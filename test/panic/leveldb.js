const panic   = require('panic-server');
const clients = panic.clients;
const manager = require('panic-manager')();

const config = {
  ip      : require('ip').address(),
  port    : 8765,
  servers : 3,
  route   : {
    '/'          : __dirname + '/index.html',
    '/gun.js'    : __dirname + '/../../gun.js',
    '/jquery.js' : __dirname + '/../../examples/jquery.js'
  }
};

panic.server().on('request', function(req, res){
  config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port);

manager.start({
  clients: Array(config.servers).fill().map((u,i) => ({
    type: 'node',
    port: config.port + i + 1,
  })),
  panic: `http://${config.ip}:${config.port}`
});

const servers = clients.filter('Node.js');
const server  = servers.pluck(1);
const alice   = servers.excluding(server).pluck(1);
const bob     = servers.excluding(server).excluding(alice).pluck(1);

describe('Make sure the leveldb storage engine works', function() {
  this.timeout(5 * 60 * 60 * 1000);

  it("Servers have joined!", function(){
    return servers.atLeast(config.servers);
  });

  it("GUN started!", () => {
    return server.run(test => {
      test.async();
      const root        = (new Function('return this'))();
      const leveldown   = require('leveldown');
      const levelup     = require('levelup');
      const {i, config} = test.props;
      const port        = config.port + i;

      if (require('fs').existsSync('./lvldata')) {
        console.error('Please delete previous data first!');
        return;
      }

      const level = levelup(leveldown('./lvldata'));
      const web   = require('http').createServer((req, res) => {
        res.end(`I am ${i}!`);
      });

      const Gun  = require('../../../index.js');
      const gun  = Gun({web, level});
      root.gun   = gun;
      root.level = level;

      web.listen(port, function(){
        test.done();
      });
    }, {i: 1, config}); 
  });

  it('Alice save data', () => {
    return alice.run(test => {
      test.async();
      const root     = (new Function('return this'))();
      const {config} = test.props;
      const Gun      = require('../../../index.js');

      // Start gun
      const gun = Gun({peers: 'http://'+ config.ip + ':' + (config.port + 1) + '/gun', lack: 1000 * 60 * 60});
      root.gun  = gun;

      // Save data
      const ref = gun.get('asdf');
      ref.put({ hello: 'world' }, ack => {
        if (ack.err) {
          if (ack.lack) return test.fail('ACK timed out, turn your lack of ack up or throughput down');
          return test.fail(ack.err);
        }
        ref.off();
        test.done();
      });
    }, {config});
  });

  it('Bob read data', () => {
    return bob.run(test => {
      test.async();
      const root     = (new Function('return this'))();
      const {config} = test.props;
      const Gun      = require('../../../index.js');

      // Start gun
      const gun = Gun({peers: 'http://'+ config.ip + ':' + (config.port + 1) + '/gun', lack: 1000 * 60 * 60});
      root.gun  = gun;

      // Read data
      const ref = gun.get('asdf');
      ref.on(data => {
        if (data.hello !== 'world') {
          return test.fail('Invalid data returned');
        }
        ref.off();
        test.done();
      });

    }, {config});
  });

//	it("Bob read data", function(){
//		this.timeout(1000 * 60 * 60 * 5);
//		//return alice.run(function(test){
//		return bob.run(function(test){
//			var n = Gun.time.is(), i = 0, c = 0, b = env.config.burst, l = env.config.each/2;
//			var raw = Gun.text.random(200, 'a');// "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
//			$('body').append($("<div id='log'></div>")); var $log = $('#log');
// 
//				var ref = window.gun.get('asdf' + i);
//				ref.on(function(data){
//					if((raw+i) !== data.hello){ return test.fail('wrong ' + i) }
//					if(d){ return } d = true;
//					c++;
//					!(i % 1000) && console.log(i+'/'+l);
//					!(i % 1000) && $log.prepend('<p>'+i+'/'+l+'</p>');
//					//console.log(i+'/'+l);
//					ref.off();
//					if(c < l){ return }
//					console.log("DONE!", c+'/'+l);
//					$log.prepend('<p>DONE! '+i+'/'+l+'</p>');
//					setTimeout(function(){
//						test.done();
//						setTimeout(function(){
//							location = 'http://asdf';
//						}, 1500)
//					}, 1);
//				});
//			}
//			function burst(){
//				if(i > l){
//					return;
//				}
//				for(var j = 0; j <= b; j++){
//					check(++i);	
//				}
//				setTimeout(burst, env.config.wait);
//			}
//			burst();
//		}, {i: 1, config: config}); 
//	});

  it("All finished", done => {
    setTimeout(() => {
      done();
    },100);
  });

  it('Shutdown everything', () => {
    return clients.run(test => {
      process.exit();
    });
  });

});

//var config = {
//	IP: require('ip').address(),
//	port: 8765,
//	servers: 2,
//	browsers: 3,
//	each: 100000, //1000000,
//	burst: 1,
//	wait: 1,
//	dir: __dirname,
//	chunk: 1024 * 1024 * 10,
//	notrad: false,
//}
//config.gundir = require('path').resolve(config.dir, '../../')+'/';

//var servers = clients.filter('Node.js');
//var server = servers.pluck(1);
//var spawn = servers.excluding(server).pluck(1);
//var browsers = clients.excluding(servers);
//var alice = browsers.pluck(1);
//var bob = browsers.excluding(alice).pluck(1);
//var carl = browsers.excluding(new panic.ClientList([alice, bob])).pluck(1);


//	it("Carl read data", function(){
//		this.timeout(1000 * 60 * 60 * 5);
//		//return alice.run(function(test){
//		return carl.run(function(test){
//			test.async();
//			console.log("I AM CARL");
//			localStorage.clear();
//			var env = test.props;
//			var gun = Gun({peers: 'http://'+ env.config.IP + ':' + (env.config.port + 2) + '/gun', localStorage: false});
//			window.gun = gun;
//			var n = Gun.time.is(), i = env.config.each / 2, c = 0, b = env.config.burst, l = env.config.each;
//			var raw = Gun.text.random(200, 'a');// "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA";
//			$('body').append($("<div id='log'></div>")); var $log = $('#log');

//			function check(i){
//				if(i > l){
//					return;
//				}
//				var d;
//				var ref = window.gun.get('asdf' + i);
//				ref.on(function(data){
//					if((raw+i) !== data.hello){ return test.fail('wrong ' + i) }
//					if(d){ return } d = true;
//					c++;
//					!(i % 1000) && console.log(i+'/'+l);
//					!(i % 1000) && $log.prepend('<p>'+i+'/'+l+'</p>');
//					//console.log(i+'/'+l);
//					ref.off();
//					if(c < (l / 2)){ return }
//					console.log("DONE!", c+'/'+l);
//					$log.prepend('<p>DONE! '+i+'/'+l+'</p>');
//					test.done();
//				});
//			}
//			function burst(){
//				if(i > l){
//					return;
//				}
//				for(var j = 0; j <= b; j++){
//					check(++i);	
//				}
//				setTimeout(burst, env.config.wait);
//			}
//			burst();
//		}, {i: 1, config: config}); 
//	});

