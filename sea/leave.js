
    var authPersist = require('./persist');
    var authsettings = require('./settings');
    var seaIndexedDb = require('./indexed').scope;
    var seaIndexedDb = require('./indexed').scope;
    // This internal func executes logout actions
    const authLeave = async (root, alias = root._.user._.alias) => {
      const { user = { _: {} } } = root._
      root._.user = null
      // Removes persisted authentication & CryptoKeys
      try {
        await authPersist({ alias })
      } catch (e) {}  //eslint-disable-line no-empty
      // TODO: is this correct way to 'logout' user from Gun.User ?
      [ 'alias', 'sea', 'pub' ].map((key) => delete user._[key])
      user._.is = user.is = {}
      // Let's use default
      root.user();
      return { ok: 0 }
    }
    module.exports = authLeave;
  