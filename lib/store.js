var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
    if(Gun.TESTING){ root.opt.file = 'radatatest' }
    this.to.next(root);
    var opt = root.opt, empty = {}, u;
    if(false === opt.radisk){ return }
    var Radisk = (Gun.window && Gun.window.Radisk) || require('./radisk');
    var Radix = Radisk.Radix;
    var LOG = console.LOG, ST = 0;
 
    opt.store = opt.store || (!Gun.window && require('./rfs')(opt));
    var rad = Radisk(opt), esc = String.fromCharCode(27);
 
    root.on('put', function(msg){
        this.to.next(msg);
        var id = msg['#'] || Gun.text.random(3), track = !msg['@'], acks = track? 0 : u; // only ack non-acks.
        var _ = (msg._||empty), got = _.rad;
        if(_.ram){ return } // in-memory ACKs to GETs do not need to be written to disk again.
        var S = (+new Date), C = 0; // STATS!
        var now = Gun.state();
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
            C++;
        });
        if(LOG && (ST = +new Date - S) > 9){ Gun.log(S, ST, 'put loop'); Gun.log(S, C, 'put loop #') }
        console.STAT && (console.STAT.radputloop = ST) && (console.STAT.radputcount = C);
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
            LOG && Gun.log(S, +new Date - S, 'put');
            root.on('in', {'@': id, ok: 1});
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
            var SPUT = tmp.put;
            if(o.atom){
                tmp = (tmp.next||empty)[o.atom] ;
                if(tmp && tmp.rad){ return }
            } else
            if(tmp && tmp.rad){ return }
        }
        var S = (+new Date), C = 0; // STATS!
        rad(key||'', function(err, data, o){
            try{opt.store.stats.get.time[statg % 50] = (+new Date) - S; ++statg;
                opt.store.stats.get.count++;
                if(err){ opt.store.stats.get.err = err }
            }catch(e){} // STATS!
            //if(u === data && o.chunks > 1){ return } // if we already sent a chunk, ignore ending empty responses. // this causes tests to fail.
            LOG && Gun.log(S, +new Date - S, 'got', JSON.stringify(key)); S = +new Date;
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
            console.STAT && (console.STAT.radgetcount = C);
            if(LOG && (ST = +new Date - S) > 9){ Gun.log(S, ST, 'got prep time'); Gun.log(S, C, 'got prep #') } C = 0; S = +new Date;
            var faith = function(){}; faith.faith = true; faith.rad = get; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
            root.on('in', {'@': id, put: graph, '%': o.more? 1 : u, err: err? err : u, _: faith});
            LOG && (ST = +new Date - S) > 9 && Gun.log(S, ST, 'got emit', Object.keys(graph||{}).length);
            graph = u; // each is outside our scope, we have to reset graph to nothing!
        }, o);
        LOG && (ST = +new Date - S) > 9 && Gun.log(S, ST, 'get call');
        console.STAT && (console.STAT.radget = ST);
        function each(val, has, a,b){ // TODO: THIS CODE NEEDS TO BE FASTER!!!!
            C++;
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
        LOG = console.LOG;
    });
    opt.store.stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // STATS!
    var statg = 0, statp = 0; // STATS!
});