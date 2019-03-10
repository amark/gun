
    const SEA = require('./sea')
    const Gun = SEA.Gun;
    // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

    // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
    Gun.on('opt', function(at){
      if(!at.sea){ // only add SEA once per instance, on the "at" context.
        at.sea = {own: {}};
        at.on('in', security, at); // now listen to all input data, acting as a firewall.
        at.on('out', signature, at); // and output listeners, to encrypt outgoing data.
        at.on('node', each, at);
      }
      this.to.next(at); // make sure to call the "next" middleware adapter.
    });

    // Alright, this next adapter gets run at the per node level in the graph database.
    // This will let us verify that every property on a node has a value signed by a public key we trust.
    // If the signature does not match, the data is just `undefined` so it doesn't get passed on.
    // If it does match, then we transform the in-memory "view" of the data into its plain value (without the signature).
    // Now NOTE! Some data is "system" data, not user data. Example: List of public keys, aliases, etc.
    // This data is self-enforced (the value can only match its ID), but that is handled in the `security` function.
    // From the self-enforced data, we can see all the edges in the graph that belong to a public key.
    // Example: ~ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
    // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
    // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
    // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
    // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
    // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
    function each(msg){ // TODO: Warning: Need to switch to `gun.on('node')`! Do not use `Gun.on('node'` in your apps!
      // NOTE: THE SECURITY FUNCTION HAS ALREADY VERIFIED THE DATA!!!
      // WE DO NOT NEED TO RE-VERIFY AGAIN, JUST TRANSFORM IT TO PLAINTEXT.
      var to = this.to, vertex = (msg.$._).put, c = 0, d;
      Gun.node.is(msg.put, function(val, key, node){
        // only process if SEA formatted?
        var tmp = Gun.obj.ify(val) || noop;
        if(u !== tmp[':']){
          node[key] = SEA.opt.unpack(tmp);
          return;
        }
        if(!SEA.opt.check(val)){ return }
        c++; // for each property on the node
        SEA.verify(val, false, function(data){ c--; // false just extracts the plain data.
          node[key] = SEA.opt.unpack(data, key, node);; // transform to plain value.
          if(d && !c && (c = -1)){ to.next(msg) }
        });
      });
      if((d = true) && !c){ to.next(msg) }
    }

    // signature handles data output, it is a proxy to the security function.
    function signature(msg){
      if((msg._||noop).user){
        return this.to.next(msg);
      }
      var ctx = this.as;
      (msg._||(msg._=function(){})).user = ctx.user;
      security.call(this, msg);
    }

    // okay! The security function handles all the heavy lifting.
    // It needs to deal read and write of input and output of system data, account/public key data, and regular data.
    // This is broken down into some pretty clear edge cases, let's go over them:
    function security(msg){
      var at = this.as, sea = at.sea, to = this.to;
      if(msg.get){
        // if there is a request to read data from us, then...
        var soul = msg.get['#'];
        if(soul){ // for now, only allow direct IDs to be read.
          if(typeof soul !== 'string'){ return to.next(msg) } // do not handle lexical cursors.
          if('alias' === soul){ // Allow reading the list of usernames/aliases in the system?
            return to.next(msg); // yes.
          } else
          if('~@' === soul.slice(0,2)){ // Allow reading the list of public keys associated with an alias?
            return to.next(msg); // yes.
          } else { // Allow reading everything?
            return to.next(msg); // yes // TODO: No! Make this a callback/event that people can filter on.
          }
        }
      }
      if(msg.put){
        // potentially parallel async operations!!!
        var check = {}, each = {}, u;
        each.node = function(node, soul){
          if(Gun.obj.empty(node, '_')){ return check['node'+soul] = 0 } // ignore empty updates, don't reject them.
          Gun.obj.map(node, each.way, {soul: soul, node: node});
        };
        each.way = function(val, key){
          var soul = this.soul, node = this.node, tmp;
          if('_' === key){ return } // ignore meta data
          if('~@' === soul){  // special case for shared system data, the list of aliases.
            each.alias(val, key, node, soul); return;
          }
          if('~@' === soul.slice(0,2)){ // special case for shared system data, the list of public keys for an alias.
            each.pubs(val, key, node, soul); return;
          }
          if('~' === soul.slice(0,1) && 2 === (tmp = soul.slice(1)).split('.').length){ // special case, account data for a public key.
            each.pub(val, key, node, soul, tmp, (msg._||noop).user); return;
          }
          each.any(val, key, node, soul, (msg._||noop).user); return;
          return each.end({err: "No other data allowed!"});
        };
        each.alias = function(val, key, node, soul){ // Example: {_:#~@, ~@alice: {#~@alice}}
          if(!val){ return each.end({err: "Data must exist!"}) } // data MUST exist
          if('~@'+key === Gun.val.link.is(val)){ return check['alias'+key] = 0 } // in fact, it must be EXACTLY equal to itself
          each.end({err: "Mismatching alias."}); // if it isn't, reject.
        };
        each.pubs = function(val, key, node, soul){ // Example: {_:#~@alice, ~asdf: {#~asdf}}
          if(!val){ return each.end({err: "Alias must exist!"}) } // data MUST exist
          if(key === Gun.val.link.is(val)){ return check['pubs'+soul+key] = 0 } // and the ID must be EXACTLY equal to its property
          each.end({err: "Alias must match!"}); // that way nobody can tamper with the list of public keys.
        };
        each.pub = function(val, key, node, soul, pub, user){ var tmp; // Example: {_:#~asdf, hello:'world'~fdsa}}
          if('pub' === key){
            if(val === pub){ return (check['pub'+soul+key] = 0) } // the account MUST match `pub` property that equals the ID of the public key.
            return each.end({err: "Account must match!"});
          }
          check['user'+soul+key] = 1;
          if(Gun.is(msg.$) && user && user.is && pub === user.is.pub){
            SEA.sign(SEA.opt.prep(tmp = SEA.opt.parse(val), key, node, soul), (user._).sea, function(data){ var rel;
              if(u === data){ return each.end({err: SEA.err || 'Pub signature fail.'}) }
              if(rel = Gun.val.link.is(val)){
                (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
              }
              node[key] = JSON.stringify({':': SEA.opt.unpack(data.m), '~': data.s});
              check['user'+soul+key] = 0;
              each.end({ok: 1});
            }, {check: SEA.opt.pack(tmp, key, node, soul), raw: 1});
            return;
          }
          SEA.verify(SEA.opt.pack(val,key,node,soul), pub, function(data){ var rel, tmp;
            data = SEA.opt.unpack(data, key, node);
            if(u === data){ // make sure the signature matches the account it claims to be on.
              return each.end({err: "Unverified data."}); // reject any updates that are signed with a mismatched account.
            }
            if((rel = Gun.val.link.is(data)) && pub === SEA.opt.pub(rel)){
              (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
            }
            check['user'+soul+key] = 0;
            each.end({ok: 1});
          });
        };
        each.any = function(val, key, node, soul, user){ var tmp, pub;
          if(!(pub = SEA.opt.pub(soul))){
            if(at.opt.secure){
              each.end({err: "Soul is missing public key at '" + key + "'."});
              return;
            }
            // TODO: Ask community if should auto-sign non user-graph data.
            check['any'+soul+key] = 1;
            at.on('secure', function(msg){ this.off();
              check['any'+soul+key] = 0;
              if(at.opt.secure){ msg = null }
              each.end(msg || {err: "Data cannot be modified."});
            }).on.on('secure', msg);
            //each.end({err: "Data cannot be modified."});
            return;
          }
          if(Gun.is(msg.$) && user && user.is && pub === user.is.pub){
            /*var other = Gun.obj.map(at.sea.own[soul], function(v, p){
              if((user.is||{}).pub !== p){ return p }
            });
            if(other){
              each.any(val, key, node, soul);
              return;
            }*/
            check['any'+soul+key] = 1;
            SEA.sign(SEA.opt.prep(tmp = SEA.opt.parse(val), key, node, soul), (user._).sea, function(data){
              if(u === data){ return each.end({err: 'My signature fail.'}) }
              node[key] = JSON.stringify({':': SEA.opt.unpack(data.m), '~': data.s});
              check['any'+soul+key] = 0;
              each.end({ok: 1});
            }, {check: SEA.opt.pack(tmp, key, node, soul), raw: 1});
            return;
          }
          check['any'+soul+key] = 1;
          SEA.verify(SEA.opt.pack(val,key,node,soul), pub, function(data){ var rel;
            data = SEA.opt.unpack(data, key, node);
            if(u === data){ return each.end({err: "Mismatched owner on '" + key + "'."}) } // thanks @rogowski !
            if((rel = Gun.val.link.is(data)) && pub === SEA.opt.pub(rel)){
              (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
            }
            check['any'+soul+key] = 0;
            each.end({ok: 1});
          });
        }
        each.end = function(ctx){ // TODO: Can't you just switch this to each.end = cb?
          if(each.err){ return }
          if((each.err = ctx.err) || ctx.no){
            console.log('NO!', each.err, msg.put); // 451 mistmached data FOR MARTTI
            return;
          }
          if(!each.end.ed){ return }
          if(Gun.obj.map(check, function(no){
            if(no){ return true }
          })){ return }
          (msg._||{}).user = at.user || security; // already been through firewall, does not need to again on out.
          to.next(msg);
        };
        Gun.obj.map(msg.put, each.node);
        each.end({end: each.end.ed = true});
        return; // need to manually call next after async.
      }
      to.next(msg); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
    }
    SEA.opt.pub = function(s){
      if(!s){ return }
      s = s.split('~');
      if(!s || !(s = s[1])){ return }
      s = s.split('.');
      if(!s || 2 > s.length){ return }
      s = s.slice(0,2).join('.');
      return s;
    }
    SEA.opt.prep = function(d,k, n,s){ // prep for signing
      return {'#':s,'.':k,':':SEA.opt.parse(d),'>':Gun.state.is(n, k)};
    }
    SEA.opt.pack = function(d,k, n,s){ // pack for verifying
      if(SEA.opt.check(d)){ return d }
      var meta = (Gun.obj.ify(d)||noop), sig = meta['~'];
      return sig? {m: {'#':s,'.':k,':':meta[':'],'>':Gun.state.is(n, k)}, s: sig} : d;
    }
    SEA.opt.unpack = function(d, k, n){ var tmp;
      if(u === d){ return }
      if(d && (u !== (tmp = d[':']))){ return tmp }
      if(!k || !n){ return }
      if(d === n[k]){ return d }
      if(!SEA.opt.check(n[k])){ return d }
      var soul = Gun.node.soul(n), s = Gun.state.is(n, k);
      if(d && 4 === d.length && soul === d[0] && k === d[1] && fl(s) === fl(d[3])){
        return d[2];
      }
      if(s < SEA.opt.shuffle_attack){
        return d;
      }
    }
    SEA.opt.shuffle_attack = 1546329600000; // Jan 1, 2019
    var noop = function(){}, u;
    var fl = Math.floor; // TODO: Still need to fix inconsistent state issue.
    var rel_is = Gun.val.rel.is;
    // TODO: Potential bug? If pub/priv key starts with `-`? IDK how possible.

  