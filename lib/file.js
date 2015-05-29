// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.

var Gun = require('../gun'), file = {};

Gun.on('opt').event(function(gun, opts){
  if(opts.s3 && opts.s3.key){ return } // don't use this plugin if S3 is being used.

  opts.file = opts.file || 'data.json';
  var fs = require('fs');
  file.raw = file.raw || (fs.existsSync||require('path').existsSync)(opts.file)? fs.readFileSync(opts.file).toString() : null;
  var all = file.all = file.all || Gun.obj.ify(file.raw || {nodes: {}, keys: {}});

	gun.opt({hooks: {
    get: function(key, cb, options){
      if(Gun.obj.is(key) && key[Gun._.soul]){
        return cb(null, all.nodes[key[Gun._.soul]]);
      }
      cb(null, all.nodes[all.keys[key]]);
    }
		,put: function(graph, cb){
      all.nodes = gun.__.graph;
			/*for(n in all.nodes){ // this causes some divergence problems, so removed for now till later when it can be fixed.
				for(k in all.nodes[n]){
					if(all.nodes[n][k] === null){
						delete all.nodes[n][k];
					}
				}
			}*/
      fs.writeFile(opts.file, Gun.text.ify(all), cb);
    }
	  ,key: function(key, soul, cb){
		  all.keys = all.keys || {};
      all.keys[key] = soul;
      fs.writeFile(opts.file, Gun.text.ify(all), cb);
    }
    ,all: function(list, opt, cb){
      opt = opt || {};
      opt.from = opt.from || '';
      opt.start = opt.from + (opt.start || '');
      if(opt.end){ opt.end = opt.from + opt.end }
      var match = {};
      cb = cb || function(){};
      Gun.obj.map(list, function(soul, key){
        var end = opt.end || key;
        if(key.indexOf(opt.from) === 0 && opt.start <= key && (key <= end || key.indexOf(end) === 0)){
          if(opt.upto){
            if(key.slice(opt.from.length).indexOf(opt.upto) === -1){
              yes(soul, key);
            }
          } else {
            yes(soul, key);
          }
        }
      });
      function yes(soul, key){
        cb(key);
        match[key] = {};
        match[key][Gun._.soul] = soul;
      }
      return match;
    }
	}}, true);
  gun.all = gun.all || function(url, cb){
    url = require('url').parse(url, true);
    var r = gun.__.opt.hooks.all(all.keys, {from: url.pathname, upto: url.query['*'], start: url.query['*>'], end: url.query['*<']});
    console.log("All please", url.pathname, url.query['*'], r);
    cb = cb || function(){};
    cb(null, r);
  }

});
