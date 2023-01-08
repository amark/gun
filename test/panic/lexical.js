/**
 * RAD Lexical search test
 * 
 * What we want here: (1) Superpeer and (n) peers
 *  - The Superpeer have a graph with `key(timestamp)->value(value)`
 *  - The peer will run an amount of queries and the total of results are the 'expected results'.
 *
 * Tip: to run this `mocha test/panic/lexical`
 * 
 */
var config = {
  IP: require('ip').address(),
  port: process.env.PORT ? parseInt(process.env.PORT) : 8765,
  servers: 1,
  browsers: 1,
  route: {
    '/': __dirname + '/index.html',
    '/gun.js': __dirname + '/../../gun.js',
    '/gun/lib/radix.js': __dirname + '/../../lib/radix.js',
    '/gun/lib/radisk.js': __dirname + '/../../lib/radisk.js',
    '/gun/lib/store.js': __dirname + '/../../lib/store.js',
    '/gun/lib/rindexed.js': __dirname + '/../../lib/rindexed.js',
    '/jquery.js': __dirname + '/../../examples/jquery.js'
  },
  wait_map: 700
}
var panic = require('panic-server');
panic.server().on('request', function(req, res) {
  config.route[req.url] && require('fs').createReadStream(config.route[req.url]).pipe(res);
}).listen(config.port);

var clients = panic.clients;
var manager = require('panic-manager')();
manager.start({
  clients: Array(config.servers).fill().map(function(u, i) {
    return {
      type: 'node',
      port: config.port + (i + 1)
    }
  }),
  panic: 'http://' + config.IP + ':' + config.port
});

var servers = clients.filter('Node.js');
var server = global.server = servers.pluck(1);
var server2 = servers.excluding(server).pluck(1);
var browsers = clients.excluding(servers);
var alice = browsers.pluck(1);
var bob = browsers.excluding(alice).pluck(1);
var john = browsers.excluding(alice).excluding(bob).pluck(1);

describe('RAD Lexical search Test!           ', function() {
  this.timeout(5 * 60 * 1000);
  // 	this.timeout(10 * 60 * 1000);
  it('Servers have joined!                   ', function() {
    return servers.atLeast(config.servers);
  });
  it('GUN server started!                    ', function() {
    return server.run(function(test) {
      var env = test.props;
      test.async();
      try { require('fs').unlinkSync('radata_test_lexical_' + env.i) } catch (e) {}
      try { require('fs').unlinkSync('radata_test_lexical_' + (env.i + 1)) } catch (e) {}
      var port = env.config.port + env.i;
      var server = require('http').createServer(function(req, res) { res.end("I am " + env.i + "!"); });
      var Gun = global.Gun = require('gun');
      var gun = global.gun = Gun({
        axe: false,
        multicast: false,
        web: server,
        file: 'radata_test_lexical_' + env.i,
        //radisk:false, localStorage:false
      });
      server.listen(port, function() {
        test.done();
      });
    }, {
      i: 1,
      config: config
    });
  });
  it('Create graph with all days of year 2020', function() {
    return server.run(function(test) {
      test.async();
      var j = 0;
      graph = gun._.graph, timenode = {}, start = new Date('2020-01-01T00:00:00Z'), end = new Date('2020-12-31T23:59:59Z'), startt = start.getTime(), endt = end.getTime(), p = startt;
      var ref = global.ref = gun.get('timenode');
      while (p <= endt) { //console.log('.... >>> ', p, ++j, new Date(p).toISOString());
        var t = new Date(p);
        var ts = t.toISOString();
        var soul = 'timeline_' + ts;
        var d = { msg: ' datetime ' + ts };
        var n = gun.get(soul).put(d);
        ref.get(ts).put(n);

        p = p + (24 * 60 * 60 * 1000); //24h
      }
      setTimeout(function() { /// wait a while for the .put
        test.done();
      }, 1000);
    });
  });
  it('Query server - Between(< item <)      ', function() {
    var i=0;
    return server.run(function(test) {
      var env = test.props;
      var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
      var results = [];
      var query = { '%': 100000, '.': { '>': '2020-02-01', '<': '2020-02-26' } };
      test.async();
      ref.get(query).map().once(function(v, k) {
         if (k && v) { results.push(k); }
      });
      var t2 = setTimeout(function() {
        var len = 25; /// expected number of results
        var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
        clearTimeout(t);
        if (results_unique.length === len) {
          test.done();
        } else {
          console.log('RESULTS Query server - Between(< item <): ', results_unique.length, results_unique.join(', '));
          test.fail('Error: get ' + results_unique.length + ' attributes.');
        }
      }, env.config.wait_map);
    }, {
      i: i += 1,
      config: config
    });
  });
  it('Query server - Higher(>)               ', function() {
    var i=0;
    return server.run(function(test) {
      var env = test.props;
      var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
      var results = [];
      var query = { '%': 100000, '.': { '>': '2020-12-01' } };
      test.async();
      ref.get(query).map().once(function(v, k) {
         if (k && v) { results.push(k); }
      });
      var t2 = setTimeout(function() {
        var len = 31; /// expected number of results
        var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
        clearTimeout(t);
        if (results_unique.length === len) {
          test.done();
        } else {
          console.log('RESULTS Query server - Higher(>): ', results_unique.length, results_unique.join(', '));
          test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
        }
      }, env.config.wait_map);
    }, {
      i: i += 1,
      config: config
    });
  });
  it('Query server - Lower(<)                ', function() {
    var i=0;
    return server.run(function(test) {
      test.async();
      var env = test.props;
      var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
      var results = [];
      var query = { '%': 100000, '.': { '<': '2020-02-06' } };
      ref.get(query).map().once(function(v, k) {
         if (k && v) { results.push(k); }
      });
      var t2 = setTimeout(function() {
        var len = 37; /// expected number of results
        var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
        clearTimeout(t);
        if (results_unique.length === len) {
          test.done();
        } else {
          console.log('RESULTS Query server - Lower(<): ', results_unique.length, results_unique.join(', '));
          test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
        }
      }, env.config.wait_map);
    }, {
      i: i += 1,
      config: config
    });
  });
  it('Query server - Exact match(=)          ', function() {
    var i=0;
    return server.run(function(test) {
      var env = test.props;
      var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
      var results = [];
      var query = { '%': 100000, '.': { '=': '2020-03-01T00:00:00.000Z' } };
      test.async();
      ref.get(query).map().once(function(v, k) {
         if (k && v) { results.push(k); }
      });
      var t2 = setTimeout(function() {
        var len = 1; /// expected number of results
        var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
        clearTimeout(t);
        if (results_unique.length === len) {
          test.done();
        } else {
          console.log('RESULTS Query server - Exact match(=): ', results_unique.length, results_unique.join(', '));
          test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
        }
      }, env.config.wait_map);
    }, {
      i: i += 1,
      config: config
    });
  });
  it('Query server - Prefix match(*)         ', function() {
    var i=0;
    return server.run(function(test) {
      var env = test.props;
      var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
      var results = [];
      var query = { '%': 100000, '.': { '*': '2020-10-' } };
      test.async();
      ref.get(query).map().once(function(v, k) {
         if (k && v) { results.push(k); }
      });
      var t2 = setTimeout(function() {
        var len = 31; /// expected number of results
        var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
        clearTimeout(t);
        if (results_unique.length === len) {
          test.done();
        } else {
          console.log('RESULTS Query server - Prefix match(*): ', results_unique.length, results_unique);
          test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
        }
      }, env.config.wait_map);
    }, {
      i: i += 1,
      config: config
    });
  });

  it(config.browsers + ' browser(s) have joined!              ', function() {
    console.log('PLEASE OPEN http://' + config.IP + ':' + config.port + ' IN ' + config.browsers + ' BROWSER(S)!');
    return browsers.atLeast(config.browsers);
  });
  it('Browsers initialized gun!              ', function() {
    var tests = [], i = 0;
    browsers.each(function(client, id) {
      tests.push(client.run(function(test) {
        test.async();
        localStorage.clear();
        console.log('Clear localStorage!!!');
//         ['/gun/lib/radix.js', '/gun/lib/radisk.js', '/gun/lib/store.js', '/gun/lib/rindexed.js'].map(function(src) {
//           var script = document.createElement('script');
//           script.setAttribute('src', src);
//           document.head.appendChild(script);
//         });

        var env = test.props;
        var opt = {
          peers: ['http://' + env.config.IP + ':' + (env.config.port + 1) + '/gun'],
          localStorage: false
        };
        var pid = location.hash.slice(1);
        if (pid) {
          opt.pid = pid;
        }
        Gun.on('opt', function(ctx) {
          this.to.next(ctx);
          ctx.on('hi', function(opt) {
            document.title = 'RAD test PID: ' + this.on.opt.pid;
          });
        });
        setTimeout(function() {
        var gun = window.gun = Gun(opt);
        var ref = window.ref = gun.get('timenode');
        test.done();
        }, 1000);
      }, {
        i: i += 1,
        config: config
      }));
    });
    return Promise.all(tests);
  });

  it('Query browser - Between(< item <)     ', function() {
    var tests = [], i = 0;
    browsers.each(function(client, id) {
      tests.push(client.run(function(test) {
        var env = test.props;
        var t = setTimeout(function() { test.fail('Error: No response.'); }, 6000);
        var results = [];
        var query = { '%': 100000, '.': { '>': '2020-06-01', '<': '2020-09-01' } };
        test.async();
        ref.get(query).map().once(function(v, k) {
          if (k && v) { results.push(k); }
        });
        var t2 = setTimeout(function() {
          var len = 30+31+31; /// expected number of results
          var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
          clearTimeout(t);
          if (results_unique.length === len) {
            test.done();
          } else {
            console.log('RESULTS Query browser - Between(< item <): ', results_unique.length, results_unique.join(', '));
            test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
          }
        }, env.config.wait_map);
      }, { i: i += 1, config: config }));
    });
    return Promise.all(tests);
  });
  it('Query browser - Higher(>)              ', function() {
    var tests = [], i = 0;
    browsers.each(function(client, id) {
      tests.push(client.run(function(test) {
      var env = test.props;
      var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
      var results = [];
      var query = { '%': 100000, '.': { '>': '2020-11-01' } };
      test.async();
      ref.get(query).map().once(function(v, k) {
         if (k && v) { results.push(k); }
      });
      var t2 = setTimeout(function() {
        var len = 61; /// expected number of results
        var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
        clearTimeout(t);
        if (results_unique.length === len) {
          test.done();
        } else {
          console.log('RESULTS Query browser - Higher(>): ', results_unique.length, results_unique.join(', '));
          test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
        }
      }, env.config.wait_map);
    }, {
        i: i += 1,
        config: config
      }));
    });
    return Promise.all(tests);
  });
  it('Query browser - Lower(<)               ', function() {
    var tests = [], i = 0;
    browsers.each(function(client, id) {
      tests.push(client.run(function(test) {
        var env = test.props;
        var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
        var results = [];
        var query = { '%': 100000, '.': { '<': '2020-02-05' } };
        test.async();
        ref.get(query).map().once(function(v, k) {
          if (k && v) { results.push(k); }
        });
        var t2 = setTimeout(function() {
          var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
          var len = 35; /// expected number of results
          clearTimeout(t);
          if (results_unique.length === len) {
            test.done();
          } else {
            console.log('RESULTS Query browser - Lower(<): ', results_unique.length, results_unique.join(', '));
            test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
          }
        }, env.config.wait_map);
      }, {
        i: i += 1,
        config: config
      }));
    });
    return Promise.all(tests);
  });
  it('Query browser - Exact match(=)         ', function() {
    var tests = [], i = 0;
    browsers.each(function(client, id) {
      tests.push(client.run(function(test) {
        var env = test.props;
        var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
        var results = [];
        var query = { '%': 100000, '.': { '=': '2020-06-01T00:00:00.000Z' } };
        test.async();
        ref.get(query).map().once(function(v, k) {
          if (k && v) { results.push(k); }
        });
        var t2 = setTimeout(function() {
          var len = 1; /// expected number of results
          var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
          clearTimeout(t);
          if (results_unique.length === len) {
            test.done();
          } else {
            console.log('RESULTS Query browser - Exact match(=): ', results_unique.length, results_unique.join(', '));
            test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
          }
        }, env.config.wait_map);
      }, {
        i: i += 1,
        config: config
      }));
    });
    return Promise.all(tests);
  });
  it('Query browser - Prefix match(*)        ', function() {
    var tests = [], i = 0;
    browsers.each(function(client, id) {
      tests.push(client.run(function(test) {
        var env = test.props;
        var t = setTimeout(function() { test.fail('Error: No response.');}, 5000);
        var results = [];
        var query = { '%': 100000, '.': { '*': '2020-10-' } };
        test.async();
        ref.get(query).map().once(function(v, k) {
          if (k && v) { results.push(k); }
        });
        var t2 = setTimeout(function() {
          var len = 31; /// expected number of results
          var results_unique = results.filter(function(v, i, a) { return a.indexOf(v) === i; }).sort();
          clearTimeout(t);
          if (results_unique.length === len) {
            test.done();
          } else {
            console.log('RESULTS Query browser - Prefix match(*): ', results_unique.length, results_unique);
            test.fail('Error: get ' + results_unique.length + ' attributes instead of '+len);
          }
        }, env.config.wait_map);
      }, {
        i: i += 1,
        config: config
      }));
    });
    return Promise.all(tests);
  });

  ////////////////////////////////
  it("Wait...", function(done){
  	setTimeout(done, 3000);
  });
  it("All finished!", function(done){
  	console.log("Done! Cleaning things up...");
  	setTimeout(function(){
  		done();
  	},1000);
  });
  after("Everything shut down.", function(){
  	browsers.run(function(){
  		//location.reload();
  		//setTimeout(function(){
  		//}, 15 * 1000);
  	});
  	return servers.run(function(){
  		process.exit();
  	});
  });
});
