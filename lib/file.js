// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.

var Gun = require('../gun'), file = {};

Gun.on('opt').event(function(gun, opts){
  if(opts.s3 && opts.s3.key){ return } // don't use this plugin if S3 is being used.

  opts.file = opts.file || 'data.json';
  var fs = require('fs');
  file.raw = file.raw || fs.existsSync(opts.file)? fs.readFileSync(opts.file).toString() : null;
  var all = file.all = file.all || Gun.obj.ify(file.raw || {nodes: {}, keys: {}});

	gun.opt({hooks: {
    load: function(key, cb, options){
      if(Gun.obj.is(key) && key[Gun._.soul]){
        return cb(null, all.nodes[key[Gun._.soul]]);
      }
      cb(null, all.nodes[all.keys[key]]);
    }
		,set: function(graph, cb){
      all.nodes = gun.__.graph;
			for(n in all.nodes){
				for(k in all.nodes[n]){
					if(all.nodes[n][k] === null){
						delete all.nodes[n][k];
					}
				}
			}
      fs.writeFile(opts.file, Gun.text.ify(all), cb);
    }
	  ,key: function(key, soul, cb){
      all.keys[key] = soul;
      fs.writeFile(opts.file, Gun.text.ify(all), cb);
    }
	}}, true);

});
