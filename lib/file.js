
var Gun = require('../gun');
var fs  = require('fs');

Gun.on('opt').event(function(gun, opts){

  var raw = fs.existsSync(opts.file || data.txt) ? fs.readFileSync(opts.file || 'data.txt').toString() : null ;
  var all = Gun.obj.ify(raw || {nodes: {}, keys: {}});
  
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
      fs.writeFile(opts.file || 'data.txt', Gun.text.ify(all), cb);
    }
	  ,key: function(key, soul, cb){
      all.keys[key] = soul;
      fs.writeFile(opts.file || 'data.txt', Gun.text.ify(all), cb);
    }
	}}, true);

});
