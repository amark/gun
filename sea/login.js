
    var authPersist = require('./persist');
    // This internal func finalizes User authentication
    const finalizeLogin = async (alias, key, root, opts) => {
      const { user } = root._
      // add our credentials in-memory only to our root gun instance
      user._ = key.at.gun._
      // so that way we can use the credentials to encrypt/decrypt data
      user._.is = user.is = {}
      // that is input/output through gun (see below)
      const { pub, priv, epub, epriv } = key
      Object.assign(user._, { alias, pub, epub, sea: { pub, priv, epub, epriv } })
      //console.log("authorized", user._);
      // persist authentication
      await authPersist(user._, key.proof, opts)
      // emit an auth event, useful for page redirects and stuff.
      try {
        root._.on('auth', user._)
      } catch (e) {
        console.log('Your \'auth\' callback crashed with:', e)
      }
      // returns success with the user data credentials.
      return user._
    }
    module.exports = finalizeLogin;
  