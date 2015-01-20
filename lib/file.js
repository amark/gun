// This was written by the wonderful Forrest Tait
// modified by Mark to be part of core for convenience
// twas not designed for production use
// only simple local development.

var Gun = require('../gun'), file = {};

Gun.on('opt').event(function(gun, opts){
  if(!opts || (opts.s3 && opts.s3.key)){ return } // don't use this plugin if S3 is being used.

  var fs  = file.fs = file.fs || require('fs');
  var raw = file.raw = file.raw || fs.existsSync(opts.file || data.txt)?
    fs.readFileSync(opts.file || 'data.json').toString()
  : null;
  var all = file.all = file.all || Gun.obj.ify(raw || {nodes: {}, keys: {}});

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
      fs.writeFile(opts.file || 'data.json', Gun.text.ify(all), cb);
    }
	  ,key: function(key, soul, cb){
      all.keys[key] = soul;
      fs.writeFile(opts.file || 'data.json', Gun.text.ify(all), cb);
    }
	}}, true);

});
