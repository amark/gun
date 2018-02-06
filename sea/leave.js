
    var authPersist = require('./persist');
    var authsettings = require('./settings');
    var seaIndexedDb = require('./indexed').scope;
    var seaIndexedDb = require('./indexed').scope;
    // This internal func executes logout actions
    const authLeave = async (root, alias = root._.user._.alias) => {
      var user = root._.user._ || {};
      [ 'get', 'soul', 'ack', 'put', 'is', 'alias', 'pub', 'epub', 'sea' ].map((key) => delete user[key])
      if(user.gun){
        delete user.gun.is;
      }
      // Let's use default
      root.user();
      // Removes persisted authentication & CryptoKeys
      try {
        await authPersist({ alias })
      } catch (e) {}  //eslint-disable-line no-empty
      return { ok: 0 }
    }
    module.exports = authLeave;
  