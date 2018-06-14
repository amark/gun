
    var SEA = require('./sea');
    var Gun = SEA.Gun;
    const queryGunAliases = require('./query')
    const parseProps = require('./parse')
    // This is internal User authentication func.
    const authenticate = async (alias, pass, gunRoot) => {
      // load all public keys associated with the username alias we want to log in with.
      const aliases = (await queryGunAliases(alias, gunRoot))
      .filter(({ pub, at: { put } = {} } = {}) => !!pub && !!put)
      // Got any?
      if (!aliases.length) {
        throw { err: 'Public key does not exist!' }
      }
      let err
      // then attempt to log into each one until we find ours!
      // (if two users have the same username AND the same password... that would be bad)
      const [ user ] = await Promise.all(aliases.map(async ({ at: at, pub: pub }) => {
        // attempt to PBKDF2 extend the password with the salt. (Verifying the signature gives us the plain text salt.)
        const auth = parseProps(at.put.auth)
      // NOTE: aliasquery uses `gun.get` which internally SEA.read verifies the data for us, so we do not need to re-verify it here.
      // SEA.verify(at.put.auth, pub).then(function(auth){
        try {
          const proof = await SEA.work(pass, auth.s)
          const props = { pub: pub, proof: proof, at: at }
          // the proof of work is evidence that we've spent some time/effort trying to log in, this slows brute force.
          /*
          MARK TO @mhelander : pub vs epub!???
          */
          const salt = auth.salt
          const sea = await SEA.decrypt(auth.ek, proof)
          if (!sea) {
            err = 'Failed to decrypt secret!'
            return
          }
          // now we have AES decrypted the private key, from when we encrypted it with the proof at registration.
          // if we were successful, then that meanswe're logged in!
          const priv = sea.priv
          const epriv = sea.epriv
          const epub = at.put.epub
          // TODO: 'salt' needed?
          err = null
          if(typeof window !== 'undefined'){
            var tmp = window.sessionStorage;
            if(tmp && gunRoot._.opt.remember){
              window.sessionStorage.alias = alias;
              window.sessionStorage.tmp = pass;
            }
          }
          return Object.assign(props, { priv: priv, salt: salt, epub: epub, epriv: epriv })
        } catch (e) {
          err = 'Failed to decrypt secret!'
          throw { err }
        }
      }))

      if (!user) {
        throw { err: err || 'Public key does not exist!' }
      }
      return user
    }
    module.exports = authenticate;
  