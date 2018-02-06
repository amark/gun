
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || require('gun/gun')
    var SEA = require('./sea');
    // After we have a GUN extension to make user registration/login easy, we then need to handle everything else.

    // We do this with a GUN adapter, we first listen to when a gun instance is created (and when its options change)
    Gun.on('opt', function(at){
      if(!at.sea){ // only add SEA once per instance, on the "at" context.
        at.sea = {own: {}};
        var uuid = at.opt.uuid || Gun.state.lex;
        at.opt.uuid = function(cb){ // TODO: consider async/await and drop callback pattern...
          if(!cb){ return }
          var id = uuid(), pair = at.user && (at.user._).sea;
          if(!pair){ return id }
          SEA.sign(id, pair).then(function(sig){
            cb(null, id + '~' + sig);
          }).catch(function(e){cb(e)});
        }
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
    // Example: pub/ASDF is the ID of a node with ASDF as its public key, signed alias and salt, and
    // its encrypted private key, but it might also have other signed values on it like `profile = <ID>` edge.
    // Using that directed edge's ID, we can then track (in memory) which IDs belong to which keys.
    // Here is a problem: Multiple public keys can "claim" any node's ID, so this is dangerous!
    // This means we should ONLY trust our "friends" (our key ring) public keys, not any ones.
    // I have not yet added that to SEA yet in this alpha release. That is coming soon, but beware in the meanwhile!
    function each(msg){ // TODO: Warning: Need to switch to `gun.on('node')`! Do not use `Gun.on('node'` in your apps!
      // NOTE: THE SECURITY FUNCTION HAS ALREADY VERIFIED THE DATA!!!
      // WE DO NOT NEED TO RE-VERIFY AGAIN, JUST TRANSFORM IT TO PLAINTEXT.
      var to = this.to, vertex = (msg.gun._).put, c = 0, d;
      Gun.node.is(msg.put, function(val, key, node){ c++; // for each property on the node
        // TODO: consider async/await use here...
        SEA.read(val, false).then(function(data){ c--; // false just extracts the plain data.
          node[key] = val = data; // transform to plain value.
          if(d && !c && (c = -1)){ to.next(msg) }
        });
      });
      d = true;
      if(d && !c){ to.next(msg) }
      return;
      /*var to = this.to, ctx = this.as;
      var own = ctx.sea.own, soul = msg.get, c = 0;
      var pub = own[soul] || soul.slice(4), vertex = (msg.gun._).put;
      Gun.node.is(msg.put, function(val, key, node){ c++; // for each property on the node.
        SEA.read(val, pub).then(function(data){ c--;
          vertex[key] = node[key] = val = data; // verify signature and get plain value.
          if(val && val['#'] && (key = Gun.val.rel.is(val))){ // if it is a relation / edge
            if('alias/' !== soul.slice(0,6)){ own[key] = pub; } // associate the public key with a node if it is itself
          }
          if(!c && (c = -1)){ to.next(msg) }
        });
      });
      if(!c){ to.next(msg) }*/
    }

    // signature handles data output, it is a proxy to the security function.
    function signature(msg){
      if(msg.user){
        return this.to.next(msg);
      }
      var ctx = this.as;
      msg.user = ctx.user;
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
          if('alias' === soul){ // Allow reading the list of usernames/aliases in the system?
            return to.next(msg); // yes.
          } else
          if('alias/' === soul.slice(0,6)){ // Allow reading the list of public keys associated with an alias?
            return to.next(msg); // yes.
          } else { // Allow reading everything?
            return to.next(msg); // yes // TODO: No! Make this a callback/event that people can filter on.
          }
        }
      }
      if(msg.put){
        // potentially parallel async operations!!!
        var check = {}, on = Gun.on(), each = {}, u;
        each.node = function(node, soul){
          if(Gun.obj.empty(node, '_')){ return check['node'+soul] = 0 } // ignore empty updates, don't reject them.
          Gun.obj.map(node, each.way, {soul: soul, node: node});
        };
        each.way = function(val, key){
          var soul = this.soul, node = this.node, tmp;
          if('_' === key){ return } // ignore meta data
          if('alias' === soul){  // special case for shared system data, the list of aliases.
            each.alias(val, key, node, soul); return;
          }
          if('alias/' === soul.slice(0,6)){ // special case for shared system data, the list of public keys for an alias.
            each.pubs(val, key, node, soul); return;
          }
          if('pub/' === soul.slice(0,4)){ // special case, account data for a public key.
            each.pub(val, key, node, soul, soul.slice(4), msg.user); return;
          }
          each.any(val, key, node, soul, msg.user); return;
          return each.end({err: "No other data allowed!"});
          /*if(!(tmp = at.user)){ return }
          if(soul.slice(4) === (tmp = tmp._).pub){ // not a special case, if we are logged in and have outbound data on us.
            each.user(val, key, node, soul, {
              pub: tmp.pub, priv: tmp.sea.priv, epub: tmp.sea.epub, epriv: tmp.sea.epriv
            });
          }
          if((tmp = sea.own[soul])){ // not special case, if we receive an update on an ID associated with a public key, then
            each.own(val, key, node, soul, tmp);
          }*/
        };
        each.alias = function(val, key, node, soul){ // Example: {_:#alias, alias/alice: {#alias/alice}}
          if(!val){ return each.end({err: "Data must exist!"}) } // data MUST exist
          if('alias/'+key === Gun.val.rel.is(val)){ return check['alias'+key] = 0 } // in fact, it must be EXACTLY equal to itself
          each.end({err: "Mismatching alias."}); // if it isn't, reject.
        };
        each.pubs = function(val, key, node, soul){ // Example: {_:#alias/alice, pub/asdf: {#pub/asdf}}
          if(!val){ return each.end({err: "Alias must exist!"}) } // data MUST exist
          if(key === Gun.val.rel.is(val)){ return check['pubs'+soul+key] = 0 } // and the ID must be EXACTLY equal to its property
          each.end({err: "Alias must match!"}); // that way nobody can tamper with the list of public keys.
        };
        each.pub = function(val, key, node, soul, pub, user){ // Example: {_:#pub/asdf, hello:SEA['world',fdsa]}
          if('pub' === key){
            if(val === pub){ return (check['pub'+soul+key] = 0) } // the account MUST match `pub` property that equals the ID of the public key.
            return each.end({err: "Account must match!"});
          }
          check['user'+soul+key] = 1;
          if(user && (user = user._) && user.sea && pub === user.pub){
              var id = Gun.text.random(3);
            SEA.write(val, Gun.obj.to(user.sea, {pub: user.pub, epub: user.epub})).then(function(data){ var rel;
              if(rel = Gun.val.rel.is(val)){
                (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
              }
              node[key] = data;
              check['user'+soul+key] = 0;
              each.end({ok: 1});
            });
            return;
          }
          // TODO: consider async/await and drop callback pattern...
          SEA.read(val, pub).then(function(data){ var rel, tmp;
            if(u === data){ // make sure the signature matches the account it claims to be on.
              return each.end({err: "Unverified data."}); // reject any updates that are signed with a mismatched account.
            }
            if((rel = Gun.val.rel.is(data)) && (tmp = rel.split('~')) && 2 === tmp.length){
              SEA.verify(tmp[0], pub, tmp[1]).then(function(ok){
                if(!ok){ return each.end({err: "Signature did not match account."}) }
                (at.sea.own[rel] = at.sea.own[rel] || {})[pub] = true;
                check['user'+soul+key] = 0;
                each.end({ok: 1});
              });
              return;
            }
            check['user'+soul+key] = 0;
            each.end({ok: 1});
          });
        };
        each.any = function(val, key, node, soul, user){ var tmp;
          if(!user || !(user = user._) || !(user = user.sea)){
            if(user = at.sea.own[soul]){
              check['any'+soul+key] = 1;
              user = Gun.obj.map(user, function(a,b){ return b });
              // TODO: consider async/await and drop callback pattern...
              SEA.read(val, user).then(function(data){ var rel;
                if(!data){ return each.end({err: "Mismatched owner on '" + key + "'.", }) }
                if((rel = Gun.val.rel.is(data)) && (tmp = rel.split('~')) && 2 === tmp.length){
                  SEA.verify(tmp[0], user, tmp[1]).then(function(ok){
                    if(!ok){ return each.end({err: "Signature did not match account."}) }
                    (at.sea.own[rel] = at.sea.own[rel] || {})[user] = true;
                    check['any'+soul+key] = 0;
                    each.end({ok: 1});
                  });
                  return;
                }
                check['any'+soul+key] = 0;
                each.end({ok: 1});
              });
              return;
            }
            check['any'+soul+key] = 1;
            if((tmp = soul.split('~')) && 2 == tmp.length){
              setTimeout(function(){ // hacky idea, what would be better?
                each.any(val, key, node, soul);
              },1);
              return;
            }
            at.on('secure', function(msg){ this.off();
              check['any'+soul+key] = 0;
              each.end(msg || {err: "Data cannot be modified."});
            }).on.on('secure', msg);
            //each.end({err: "Data cannot be modified."});
            return;
          }
          if(!(tmp = soul.split('~')) || 2 !== tmp.length){
            each.end({err: "Soul is not signed at '" + key + "'."});
            return;
          }
          var other = Gun.obj.map(at.sea.own[soul], function(v, p){
            if(user.pub !== p){ return p }
          });
          if(other){
            each.any(val, key, node, soul);
            return;
          }
          check['any'+soul+key] = 1;
          // TODO: consider async/await and drop callback pattern...
          SEA.verify(tmp[0], user.pub, tmp[1]).then(function(ok){
            if(!ok){ return each.end({err: "Signature did not match account at '" + key + "'."}) }
            (at.sea.own[soul] = at.sea.own[soul] || {})[user.pub] = true;
            SEA.write(val, user).then(function(data){
              node[key] = data;
              check['any'+soul+key] = 0;
              each.end({ok: 1});
            });
          });
        }
        each.end = function(ctx){ // TODO: Can't you just switch this to each.end = cb?
          if(each.err){ return }
          if((each.err = ctx.err) || ctx.no){
            console.log('NO!', each.err, msg.put);
            return;
          }
          if(!each.end.ed){ return }
          if(Gun.obj.map(check, function(no){
            if(no){ return true }
          })){ return }
          to.next(msg);
        };
        Gun.obj.map(msg.put, each.node);
        each.end({end: each.end.ed = true});
        return; // need to manually call next after async.
      }
      to.next(msg); // pass forward any data we do not know how to handle or process (this allows custom security protocols).
    }

  