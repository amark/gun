
    var SEA = require('./root');
    // This is to certify that a group of "certificants" can "put" anything at a group of matched "paths" to the certificate authority's graph
    SEA.certify = SEA.certify || (async (certificants, policy = {}, authority, cb, opt = {}) => { try {
      /*
      IMPORTANT: A Certificate is like a Signature. No one knows who (authority) created/signed a cert until you put it into their graph.
      "certificants": '*' or a String (Bob.pub) || an Object that contains "pub" as a key || an array of [object || string]. These people will have the rights.
      "policy": A string ('inbox'), or a RAD/LEX object {'*': 'inbox'}, or an Array of RAD/LEX objects or strings. RAD/LEX object can contain key "?" with indexOf("*") > -1 to force key equals certificant pub. This rule is used to check against soul+'/'+key using Gun.text.match or String.match.
      "authority": Key pair or priv of the certificate authority.
      "cb": A callback function after all things are done.
      "opt": If opt.expiry (a timestamp) is set, SEA won't sync data after opt.expiry. If opt.blacklist is set, SEA will look for blacklist before syncing.
      */
      console.log('SEA.certify() is an early experimental community supported method that may change API behavior without warning in any future version.')

      certificants = (() => {
        var data = []
        if (certificants) {
          if ((typeof certificants === 'string' || Array.isArray(certificants)) && certificants.indexOf('*') !== -1) return '*'
          if (typeof certificants === 'string') {
            return certificants
          }

          if (Array.isArray(certificants)) {
            if (certificants.length === 1 && certificants[0]) return typeof certificants[0] === 'object' && certificants[0].pub ? certificants[0].pub : typeof certificants[0] === 'string' ? certificants[0] : null
            certificants.map(certificant => {
              if (typeof certificant ==='string') data.push(certificant)
              else if (typeof certificant === 'object' && certificant.pub) data.push(certificant.pub)
            })
          }

          if (typeof certificants === 'object' && certificants.pub) return certificants.pub
          return data.length > 0 ? data : null
        }
        return null
      })()

      if (!certificants) return console.log("No certificant found.")

      const expiry = opt.expiry && (typeof opt.expiry === 'number' || typeof opt.expiry === 'string') ? parseFloat(opt.expiry) : null
      const readPolicy = (policy || {}).read ? policy.read : null
      const writePolicy = (policy || {}).write ? policy.write : typeof policy === 'string' || Array.isArray(policy) || policy["+"] || policy["#"] || policy["."] || policy["="] || policy["*"] || policy[">"] || policy["<"] ? policy : null
      const readBlacklist = ((opt || {}).blacklist || {}).read && (typeof opt.blacklist.read === 'string' || opt.blacklist.read['#']) ? opt.blacklist.read : null
      const writeBlacklist = typeof (opt || {}).blacklist === 'string' || (((opt || {}).blacklist || {}).write || {})['#'] ? opt.blacklist : ((opt || {}).blacklist || {}).write && (typeof opt.blacklist.write === 'string' || opt.blacklist.write['#']) ? opt.blacklist.write : null

      if (!readPolicy && !writePolicy) return console.log("No policy found.")

      // reserved keys: c, e, r, w, rb, wb
      const data = JSON.stringify({
        c: certificants,
        ...(expiry ? {e: expiry} : {}), // inject expiry if possible
        ...(readPolicy ? {r: readPolicy }  : {}), // "r" stands for read, which means read permission.
        ...(writePolicy ? {w: writePolicy} : {}), // "w" stands for write, which means write permission.
        ...(readBlacklist ? {rb: readBlacklist} : {}), // inject READ blacklist if possible
        ...(writeBlacklist ? {wb: writeBlacklist} : {}), // inject WRITE blacklist if possible
      })

      const certificate = await SEA.sign(data, authority, null, {raw:1})

      var r = certificate
      if(!opt.raw){ r = 'SEA'+JSON.stringify(r) }
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.certify;
  