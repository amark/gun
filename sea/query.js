
    var SEA = require('./sea');
    var Gun = SEA.Gun;
    // This is internal func queries public key(s) for alias.
    const queryGunAliases = (alias, gunRoot) => new Promise((resolve, reject) => {
      // load all public keys associated with the username alias we want to log in with.
      gunRoot.get(`alias/${alias}`).get((rat, rev) => {
        rev.off();
        if (!rat.put) {
          // if no user, don't do anything.
          const err = 'No user!'
          Gun.log(err)
          return reject({ err })
        }
        // then figuring out all possible candidates having matching username
        const aliases = []
        let c = 0
        // TODO: how about having real chainable map without callback ?
        Gun.obj.map(rat.put, (at, pub) => {
          if (!pub.slice || 'pub/' !== pub.slice(0, 4)) {
            // TODO: ... this would then be .filter((at, pub))
            return
          }
          ++c
          // grab the account associated with this public key.
          gunRoot.get(pub).get((at, ev) => {
            pub = pub.slice(4)
            ev.off()
            --c
            if (at.put){
              aliases.push({ pub, at })
            }
            if (!c && (c = -1)) {
              resolve(aliases)
            }
          })
        })
        if (!c) {
          reject({ err: 'Public key does not exist!' })
        }
      })
    })
    module.exports = queryGunAliases
  