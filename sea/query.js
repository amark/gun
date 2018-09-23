
    var SEA = require('./sea');
    var Gun = SEA.Gun;
    // This is internal func queries public key(s) for alias.
    const queryGunAliases = (alias, gunRoot) => new Promise((resolve, reject) => {
      // load all public keys associated with the username alias we want to log in with.
      gunRoot.get('~@'+alias).once((data, key) => {
        //rev.off();
        if (!data) {
          // if no user, don't do anything.
          const err = 'No user!'
          Gun.log(err)
          return reject({ err })
        }
        // then figuring out all possible candidates having matching username
        const aliases = []
        let c = 0
        // TODO: how about having real chainable map without callback ?
        Gun.obj.map(data, (at, pub) => {
          if (!pub.slice || '~' !== pub.slice(0, 1)) {
            // TODO: ... this would then be .filter((at, pub))
            return
          }
          ++c
          // grab the account associated with this public key.
          gunRoot.get(pub).once(data => {
            pub = pub.slice(1)
            --c
            if (data){
              aliases.push({ pub, put: data })
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
  