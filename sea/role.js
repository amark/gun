;(function(){

    var SEA = require('./root');

    /**
     * SEA.role.grant(admin, userPub, role, cb, opt)
     * Issue a signed role token: the administrator (admin pair) signs
     * { u: userPub, r: role, iat: now, exp: expiry } with their private key.
     * Role tokens are self-contained, verifiable anywhere, and can be stored
     * in a "roles node" in the graph (e.g. ~adminPub/roles/{role}) or handed
     * directly to the user. Anyone holding the admin's public key can verify.
     * @param {object} admin - the administrator's pair ({pub, priv}); required.
     * @param {string} userPub - the public key of the user being granted the role.
     * @param {string} role - the role name (e.g. 'admin', 'editor', 'viewer').
     * @param {function} [cb] - optional callback `cb(token)`; promise returned regardless.
     * @param {object} [opt] - { expiry }: absolute expiry timestamp (ms);
     *                         0/omitted means the token never expires.
     * @returns {Promise<string>} the signed role token (SEA-signed string).
     */
    SEA.role = SEA.role || {};
    SEA.role.grant = SEA.role.grant || (async (admin, userPub, role, cb, opt) => { try {
      opt = opt || {};
      if(!admin || !admin.priv){ throw 'No administrator pair (priv).' }
      if(!userPub || 'string' !== typeof userPub){ throw 'No user public key.' }
      if(!role || 'string' !== typeof role){ throw 'No role name.' }
      var payload = { u: userPub, r: role, iat: Date.now(), exp: parseFloat(opt.expiry) || 0 };
      var token = await SEA.sign(JSON.stringify(payload), admin, null, opt);
      if(cb){ try{ cb(token) }catch(e){console.log(e)} }
      return token;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    /**
     * SEA.role.verify(token, adminPub, cb, opt)
     * Verify a role token against the administrator's public key.
     * @param {string} token - the signed role token from SEA.role.grant.
     * @param {string} adminPub - the administrator's public key.
     * @param {function} [cb] - optional callback `cb(payload)`; promise returned regardless.
     * @param {object} [opt] - { now }: custom "current time" (ms) for expiry checks (testing).
     * @returns {Promise<object|undefined>} { u, r, iat, exp } if valid and not expired, else undefined.
     */
    SEA.role.verify = SEA.role.verify || (async (token, adminPub, cb, opt) => { try {
      opt = opt || {};
      if(!token || 'string' !== typeof token){ throw 'No role token.' }
      if(!adminPub || 'string' !== typeof adminPub){ throw 'No administrator public key.' }
      var payload = await SEA.verify(token, adminPub, null, opt); // returns parsed {u, r, iat, exp} or undefined
      if(!payload || !payload.u || !payload.r){ return; } // invalid or not signed by admin
      var now = parseFloat(opt.now) || Date.now();
      if(payload.exp && payload.exp < now){ return; } // expired
      if(cb){ try{ cb(payload) }catch(e){console.log(e)} }
      return payload;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    /**
     * SEA.role.has(token, role, userPub, adminPub, cb, opt)
     * Convenience check: does this token grant `role` to `userPub`?
     * @returns {Promise<boolean>} true only if the token verifies AND matches role AND user.
     */
    SEA.role.has = SEA.role.has || (async (token, role, userPub, adminPub, cb, opt) => { try {
      opt = opt || {};
      var payload = await SEA.role.verify(token, adminPub, null, opt);
      var ok = !!(payload && payload.r === role && payload.u === userPub);
      if(cb){ try{ cb(ok) }catch(e){console.log(e)} }
      return ok;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.role;
  
}());