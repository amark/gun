var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
    if(Gun.TESTING){ root.opt.file = 'radatatest' }
    this.to.next(root);
    var opt = root.opt, empty = {}, u;
    if(false === opt.radisk){ return }
    var Radisk = (Gun.window && Gun.window.Radisk) || require('./radisk');
    var Radix = Radisk.Radix;
    var LOG = console.LOG;
 
    opt.store = opt.store || (!Gun.window && require('./rfs')(opt));
    var rad = Radisk(opt), esc = String.fromCharCode(27);
 
    root.on('put', function(msg){
        this.to.next(msg);
        var id = msg['#'] || Gun.text.random(3), track = !msg['@'], acks = track? 0 : u; // only ack non-acks.
        var got = (msg._||empty).rad, now = Gun.state();
        var S = (+new Date); // STATS!
        Gun.graph.is(msg.put, null, function(val, key, node, soul){
            if(!track && got){
                var at = (root.next||empty)[soul];
                if(!at){ return }
                if(u !== got['.']){ at = (at.next||empty)[key] }
                if(!at){ return }
                at.rad = now;
                return;
            }
            if(track){ ++acks }
            //console.log('put:', soul, key, val);
            val = Radisk.encode(val, null, esc)+'>'+Radisk.encode(Gun.state.is(node, key), null, esc);
            rad(soul+esc+key, val, (track? ack : u));
        });
        LOG && Gun.log(S, +new Date - S, 'put loop');
        function ack(err, ok){
            acks--;
            if(ack.err){ return }
            if(ack.err = err){
                //Gun.log(); //try{opt.store.stats.put.err = err}catch(e){} // STATS!
                root.on('in', {'@': id, err: err});
                return;
            }
            if(acks){ return }
            try{opt.store.stats.put.time[statp % 50] = (+new Date) - S; ++statp;
                opt.store.stats.put.count++;
            }catch(e){} // STATS!
            //console.log(+new Date - S, 'put'); S = +new Date;
            root.on('in', {'@': id, ok: 1});
            //console.log(S, +new Date - S, 'put sent');
        }
    });
 
    root.on('get', function(msg){
        this.to.next(msg);
        var id = msg['#'], get = msg.get, soul = msg.get['#'], has = msg.get['.']||'', o = {}, graph, lex, key, tmp, force;
        if('string' == typeof soul){
            key = soul;
        } else 
        if(soul){
            if(u !== (tmp = soul['*'])){ o.limit = force = 1 }
            if(u !== soul['>']){ o.start = soul['>'] }
            if(u !== soul['<']){ o.end = soul['<'] }
            key = force? (''+tmp) : tmp || soul['='];
            force = null;
        }
        if(key && !o.limit){ // a soul.has must be on a soul, and not during soul*
            if('string' == typeof has){
                key = key+esc+(o.atom = has);
            } else 
            if(has){
                if(u !== has['>']){ o.start = has['>']; o.limit = 1 }
                if(u !== has['<']){ o.end = has['<']; o.limit = 1 }
                if(u !== (tmp = has['*'])){ o.limit = force = 1 }
                if(key){ key = key+esc + (force? (''+(tmp||'')) : tmp || (o.atom = has['='] || '')) }
            }
        }
        if((tmp = get['%']) || o.limit){
            o.limit = (tmp <= (o.pack || (1000 * 100)))? tmp : 1;
        }
        if(has['-'] || (soul||{})['-']){ o.reverse = true }
        if((tmp = (root.next||empty)[soul]) && tmp.put){
            if(o.atom){
                tmp = (tmp.next||empty)[o.atom] ;
                if(tmp && tmp.rad){ return }
            } else
            if(tmp && tmp.rad){
                return;
            }
        }
        var S = (+new Date); // STATS!
        rad(key||'', function(err, data, o){
            try{opt.store.stats.get.time[statg % 50] = (+new Date) - S; ++statg;
                opt.store.stats.get.count++;
                if(err){ opt.store.stats.get.err = err }
            }catch(e){} // STATS!
            //if(u === data && o.chunks > 1){ return } // if we already sent a chunk, ignore ending empty responses. // this causes tests to fail.
            LOG && Gun.log(S, +new Date - S, 'got'); S = +new Date; // MARK RETURN HERE!!!! Gun.log will always log unless off :/ switch to something like LOG && whatever?
            if(data){
                if(typeof data !== 'string'){
                    if(o.atom){
                        data = u;
                    } else {
                        Radix.map(data, each) 
                    }
                }
                if(!graph && data){ each(data, '') }
            }
            LOG && Gun.log(S, +new Date - S, 'got prep');
            root.on('in', {'@': id, put: graph, '%': o.more? 1 : u, err: err? err : u, _: each});
        }, o);
        LOG && Gun.log(S, +new Date - S, 'get call');
        function each(val, has, a,b){
            if(!val){ return }
            has = (key+has).split(esc);
            var soul = has.slice(0,1)[0];
            has = has.slice(-1)[0];
            o.count = (o.count || 0) + val.length;
            var tmp = val.lastIndexOf('>');
            var state = Radisk.decode(val.slice(tmp+1), null, esc);
            val = Radisk.decode(val.slice(0,tmp), null, esc);
            (graph = graph || {})[soul] = Gun.state.ify(graph[soul], has, state, val, soul);
            if(o.limit && o.limit <= o.count){ return true }
        }
        each.rad = get;
        LOG = console.LOG;
    });
    opt.store.stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // STATS!
    var statg = 0, statp = 0; // STATS!
});