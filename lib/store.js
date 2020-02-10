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
    var dare = Radisk(opt), esc = String.fromCharCode(27);
 
    root.on('put2', function(msg){
        this.to.next(msg);
        var id = msg['#'], put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], tmp;
        tmp = soul+esc+key; // soul+key; // be nice to move away from escaping
        dare(tmp, {':': val, '>': state}, function(err, ok){
            if(msg.ack){ msg.ack(err, ok || 1) } return; // REVISE THIS IN FUTURE!!!
            if(err){ root.on('in', {'@': id, err: err}); return }
            root.on('in', {'@': id, ok: ok});
        });
    });

    root.on('put', function(msg){
        this.to.next(msg);
        var id = msg['#'] || Gun.text.random(3), track = !msg['@'], acks = track? 0 : u; // only ack non-acks.
        var _ = (msg._||''), got = _.rad;
        if(got){ return } // RAD's own ACKs to GETs do not need to be written to disk again.
        if(_.ram){ return } // in-memory ACKs to GETs do not need to be written to disk again.
        if(true || !Gun.TESTING){ root.on('in', {'@': msg['#'], err: console.log('Migration not done, please report this to & complain at Mark in http://chat.gun.eco !')}); return }
        var S = (+new Date), C = 0; // STATS!
        var now = Gun.state();
        Gun.graph.is(msg.put, null, function(val, key, node, soul){
            if(!track && got){
                var at = (root.next||'')[soul];
                if(!at){ return }
                if(u !== got['.']){ at = (at.next||'')[key] }
                if(!at){ return }
                at.rad = now;
                return;
            }
            if(track){ ++acks }
            dare(soul+esc+key, {':': val, '>': Gun.state.is(node, key)}, (track? ack : u));
            //val = Radisk.encode(val, null, esc)+'>'+Radisk.encode(Gun.state.is(node, key), null, esc);
            //rad(soul+esc+key, val, (track? ack : u));
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
        if((tmp = (root.next||'')[soul]) && tmp.put){
            if(o.atom){
                tmp = (tmp.next||'')[o.atom] ;
                if(tmp && tmp.rad){ return }
            } else
            if(tmp && tmp.rad){ return }
        }
        var now = Gun.state();
        var S = (+new Date), C = 0; // STATS!
        //rad(key||'', function(err, data, o){
        //console.log("STORE GET:", JSON.stringify(key||''), o);
        dare(key||'', function(err, data, info){
            //console.log("STORE GOT:", data);
            try{opt.store.stats.get.time[statg % 50] = (+new Date) - S; ++statg;
                opt.store.stats.get.count++;
                if(err){ opt.store.stats.get.err = err }
            }catch(e){} // STATS!
            //if(u === data && info.chunks > 1){ return } // if we already sent a chunk, ignore ending empty responses. // this causes tests to fail.
            LOG && Gun.log(S, +new Date - S, 'got', JSON.stringify(key)); S = +new Date;
            info = info || '';
            var va, ve;
            if(info.unit && data && u !== (va = data[':']) && u !== (ve = data['>'])){ // new format
                var tmp = key.split(esc), so = tmp[0], ha = tmp[1];
                (graph = graph || {})[so] = Gun.state.ify(graph[so], ha, ve, va, so);
                root.$.get(so).get(ha)._.rad = now;
                // REMEMBER TO ADD _rad TO NODE/SOUL QUERY!
            } else
            if(data){ // old code path
                if(typeof data !== 'string'){
                    if(o.atom){
                        data = u;
                    } else {
                        Radix.map(data, each); // IS A RADIX TREE, NOT FUNCTION!
                    }
                }
                if(!graph && data){ each(data, '') }
            }
            console.STAT && (console.STAT.radgetcount = C);
            if(LOG && (ST = +new Date - S) > 9){ Gun.log(S, ST, 'got prep time'); Gun.log(S, C, 'got prep #') } C = 0; S = +new Date;
            var faith = function(){}; faith.faith = true; faith.rad = get; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
            root.on('in', {'@': id, put: graph, '%': info.more? 1 : u, err: err? err : u, _: faith});
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
            if(o.limit && o.limit <= o.count){ return true }
            var va, ve, so = soul, ha = has;
            //if(u !== (va = val[':']) && u !== (ve = val['>'])){ // THIS HANDLES NEW CODE!
            if('string' != typeof val){ // THIS HANDLES NEW CODE!
                va = val[':']; ve = val['>'];
                (graph = graph || {})[so] = Gun.state.ify(graph[so], ha, ve, va, so);
                //root.$.get(so).get(ha)._.rad = now;
                o.count = (o.count || 0) + ((va||'').length || 9);
                return;
            }
            o.count = (o.count || 0) + val.length;
            var tmp = val.lastIndexOf('>');
            var state = Radisk.decode(val.slice(tmp+1), null, esc);
            val = Radisk.decode(val.slice(0,tmp), null, esc);
            (graph = graph || {})[soul] = Gun.state.ify(graph[soul], has, state, val, soul);
        }
        LOG = console.LOG;
    });
    var val_is = Gun.val.is
    opt.store.stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // STATS!
    var statg = 0, statp = 0; // STATS!
});