var Gun = (typeof window !== "undefined")? window.Gun : require('../gun');

Gun.on('create', function(root){
    if(Gun.TESTING){ root.opt.file = 'radatatest' }
    this.to.next(root);
    var opt = root.opt, empty = {}, u;
    if(false === opt.rad || false === opt.radisk){ return }
    if((u+'' != typeof process) && 'false' === ''+(process.env||'').RAD){ return }
    var Radisk = (Gun.window && Gun.window.Radisk) || require('./radisk');
    var Radix = Radisk.Radix;
    var dare = Radisk(opt), esc = String.fromCharCode(27);
    var ST = 0;
 
    root.on('put', function(msg){
        this.to.next(msg);
        if((msg._||'').rad){ return } // don't save what just came from a read.
        var id = msg['#'], put = msg.put, soul = put['#'], key = put['.'], val = put[':'], state = put['>'], tmp;
        var DBG = (msg._||'').DBG; DBG && (DBG.sp = DBG.sp || +new Date);
        //var lot = (msg._||'').lot||''; count[id] = (count[id] || 0) + 1; 
        var S = (msg._||'').RPS || ((msg._||'').RPS = +new Date);
        //console.log("PUT ------->>>", soul,key, val, state);
        //dare(soul+esc+key, {':': val, '>': state}, dare.one[id] || function(err, ok){
        dare(soul+esc+key, {':': val, '>': state}, function(err, ok){
            //console.log("<<<------- PAT", soul,key, val, state, 'in', +new Date - S);
            DBG && (DBG.spd = DBG.spd || +new Date);
            console.STAT && console.STAT(S, +new Date - S, 'put');
            //if(!err && count[id] !== lot.s){ console.log(err = "Disk count not same as ram count."); console.STAT && console.STAT(+new Date, lot.s - count[id], 'put ack != count') } delete count[id];
            if(err){ root.on('in', {'@': id, err: err, DBG: DBG}); return }
            root.on('in', {'@': id, ok: ok, DBG: DBG});
        //}, id, DBG && (DBG.r = DBG.r || {}));
        }, false && id, DBG && (DBG.r = DBG.r || {}));
        DBG && (DBG.sps = DBG.sps || +new Date);
    });
    var count = {}, obj_empty = Object.empty;
 
    root.on('get', function(msg){
        this.to.next(msg);
        var ctx = msg._||'', DBG = ctx.DBG = msg.DBG; DBG && (DBG.sg = +new Date);
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
        if(has['-'] || (soul||{})['-'] || get['-']){ o.reverse = true }
        if((tmp = (root.next||'')[soul]) && tmp.put){
            if(o.atom){
                tmp = (tmp.next||'')[o.atom] ;
                if(tmp && tmp.rad){ return }
            } else
            if(tmp && tmp.rad){ return }
        }
        var now = Gun.state();
        var S = (+new Date), C = 0, SPT = 0; // STATS!
        DBG && (DBG.sgm = S);
        //var GID = String.random(3); console.log("GET ------->>>", GID, key, o, '?', get);
        dare(key||'', function(err, data, info){
            //console.log("<<<------- GOT", GID, +new Date - S, err, data);
            DBG && (DBG.sgr = +new Date);
            DBG && (DBG.sgi = info);
            try{opt.store.stats.get.time[statg % 50] = (+new Date) - S; ++statg;
                opt.store.stats.get.count++;
                if(err){ opt.store.stats.get.err = err }
            }catch(e){} // STATS!
            //if(u === data && info.chunks > 1){ return } // if we already sent a chunk, ignore ending empty responses. // this causes tests to fail.
            console.STAT && console.STAT(S, +new Date - S, 'got', JSON.stringify(key)); S = +new Date;
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
                        Radix.map(data, each, o); // IS A RADIX TREE, NOT FUNCTION!
                    }
                }
                if(!graph && data){ each(data, '') }
                // TODO: !has what about soul lookups?
                if(!o.atom && !has & 'string' == typeof soul && !o.limit && !o.more){
                    root.$.get(soul)._.rad = now;
                }
            }
            DBG && (DBG.sgp = +new Date);
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // TODO: PERF NOTES! This is like 0.2s, but for each ack, or all? Can you cache these preps?
            // Or benchmark by reusing first start date.
            if(console.STAT && (ST = +new Date - S) > 9){ console.STAT(S, ST, 'got prep time'); console.STAT(S, C, 'got prep #') } SPT += ST; C = 0; S = +new Date;
            var faith = function(){}; faith.faith = true; faith.rad = get; // HNPERF: We're testing performance improvement by skipping going through security again, but this should be audited.
            root.on('in', {'@': id, put: graph, '%': info.more? 1 : u, err: err? err : u, _: faith, DBG: DBG});
            console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'got emit', Object.keys(graph||{}).length);
            graph = u; // each is outside our scope, we have to reset graph to nothing!
        }, o, DBG && (DBG.r = DBG.r || {}));
        DBG && (DBG.sgd = +new Date);
        console.STAT && (ST = +new Date - S) > 9 && console.STAT(S, ST, 'get call'); // TODO: Perf: this was half a second??????
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
    });
    var val_is = Gun.valid;
    (opt.store||{}).stats = {get:{time:{}, count:0}, put: {time:{}, count:0}}; // STATS!
    var statg = 0, statp = 0; // STATS!
});