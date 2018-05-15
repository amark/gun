
    const authPersist = require('./persist')
    const authsettings = require('./settings')
    //const { scope: seaIndexedDb } = require('./indexed')
    // This internal func executes logout actions
    const authLeave = async (gunRoot, alias = gunRoot._.user._.alias) => {
      var user = gunRoot._.user._ || {};
      [ 'get', 'soul', 'ack', 'put', 'is', 'alias', 'pub', 'epub', 'sea' ].map((key) => delete user[key])
      if(user.gun){
        delete user.gun.is;
      }
      // Let's use default
      gunRoot.user();
      // Removes persisted authentication & CryptoKeys
      try {
        await authPersist({ alias })
      } catch (e) {}  //eslint-disable-line no-empty
      return { ok: 0 }
    }
    module.exports = authLeave
  