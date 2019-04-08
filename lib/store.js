var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');
 
Gun.on('create', function(root){
    this.to.next(root);
    var opt = root.opt, u;
    if(false === opt.radisk){ return }
    var Radisk = (Gun.window && Gun.window.Radisk) || require('./radisk');
    var Radix = Radisk.Radix;
 
    opt.store = opt.store || (!Gun.window && require('./rfs')(opt));
    var rad = Radisk(opt), esc = String.fromCharCode(27);
 
    root.on('put', function(msg){
        this.to.next(msg);
        var id = msg['#'] || Gun.text.random(3), track = !msg['@'], acks = track? 0 : u; // only ack non-acks.
        if(msg.rad && !track){ return } // don't save our own acks
        Gun.graph.is(msg.put, null, function(val, key, node, soul){
            if(track){ ++acks }
            //console.log('put:', soul, key, val);
            val = Radisk.encode(val, null, esc)+'>'+Radisk.encode(Gun.state.is(node, key), null, esc);
            rad(soul+esc+key, val, (track? ack : u));
        });
        function ack(err, ok){
            acks--;
            if(ack.err){ return }
            if(ack.err = err){
                root.on('in', {'@': id, err: err});
                return;
            }
            if(acks){ return }
            //console.log("PAT!", id);
            root.on('in', {'@': id, ok: 1});
        }
    });
 
    root.on('get', function(msg){
        this.to.next(msg);
        var id = msg['#'], get = msg.get, soul = msg.get['#'], has = msg.get['.']||'', opt = {}, graph, lex, key, tmp;
        if(typeof soul == 'string'){
            key = soul;
        } else 
        if(soul){
            if(tmp = soul['*']){ opt.limit = 1 }
            key = tmp || soul['='];
        }
        if(key && !opt.limit){ // a soul.has must be on a soul, and not during soul*
            if(typeof has == 'string'){
                key = key+esc+(opt.atom = has);
            } else 
            if(has){
                if(tmp = has['*']){ opt.limit = 1 }
                if(key){ key = key+esc + (tmp || (opt.atom = has['='])) }
            }
        }
        if((tmp = get['%']) || opt.limit){
            opt.limit = (tmp <= (opt.pack || (1000 * 100)))? tmp : 1;
        }
        //var start = (+new Date); // console.log("GET!", id, JSON.stringify(key));
        rad(key||'', function(err, data, o){
            if(data){
                if(typeof data !== 'string'){
                    if(opt.atom){
                        data = u;
                    } else {
                        Radix.map(data, each) 
                    }
                }
                if(!graph && data){ each(data, '') }
            }
            //console.log("GOT!", id, JSON.stringify(key), ((+new Date) - start));
            root.on('in', {'@': id, put: graph, err: err? err : u, rad: Radix});
        }, opt);
        function each(val, has, a,b){
            if(!val){ return }
            has = (key+has).split(esc);
            var soul = has.slice(0,1)[0];
            has = has.slice(-1)[0];
            opt.count = (opt.count || 0) + val.length;
            tmp = val.lastIndexOf('>');
            var state = Radisk.decode(val.slice(tmp+1), null, esc);
            val = Radisk.decode(val.slice(0,tmp), null, esc);
            (graph = graph || {})[soul] = Gun.state.ify(graph[soul], has, state, val, soul);
            if(opt.limit && opt.limit <= opt.count){ return true }
        }
    });
});