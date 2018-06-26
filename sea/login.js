
    const authPersist = require('./persist')
    // This internal func finalizes User authentication
    const finalizeLogin = async (alias, key, gunRoot, opts) => {
      const user = gunRoot._.user
      // add our credentials in-memory only to our root gun instance
      //var tmp = user._.tag;
      var opt = user._.opt;
      user._ = key.at.$._;
      user._.opt = opt;
      //user._.tag = tmp || user._.tag;
      // so that way we can use the credentials to encrypt/decrypt data
      // that is input/output through gun (see below)
      const pub = key.pub
      const priv = key.priv
      const epub = key.epub
      const epriv = key.epriv
      user._.is = user.is = {alias: alias, pub: pub};
      Object.assign(user._, { alias: alias, pub: pub, epub: epub, sea: { pub: pub, priv: priv, epub: epub, epriv: epriv } })
      //console.log("authorized", user._);
      // persist authentication
      //await authPersist(user._, key.proof, opts) // temporarily disabled
      // emit an auth event, useful for page redirects and stuff.  
      try {
        gunRoot._.on('auth', user._)
      } catch (e) {
        console.log('Your \'auth\' callback crashed with:', e)
      }
      // returns success with the user data credentials.
      return user._
    }
    module.exports = finalizeLogin
  