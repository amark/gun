
    // TODO: BUG! `SEA` needs to be USED!
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || require('gun/gun')
    const authsettings = require('./settings')
    const SEA = require('./sea');
    //const { scope: seaIndexedDb } = require('./indexed')
    // This updates sessionStorage & IndexedDB to persist authenticated "session"
    const updateStorage = (proof, key, pin) => async (props) => {
      if (!Gun.obj.has(props, 'alias')) {
        return  // No 'alias' - we're done.
      }
      if (authsettings.validity && proof && Gun.obj.has(props, 'iat')) {
        props.proof = proof
        delete props.remember   // Not stored if present

        const { alias, alias: id } = props
        const remember = { alias, pin }

        try {
          const signed = await SEA.sign(JSON.stringify(remember), key)

          sessionStorage.setItem('user', alias)
          sessionStorage.setItem('remember', signed)

          const encrypted = await SEA.encrypt(props, pin)

          if (encrypted) {
            const auth = await SEA.sign(encrypted, key)
            await seaIndexedDb.wipe() // NO! Do not do this. It ruins other people's sessionStorage code. This is bad/wrong, commenting it out.
            await seaIndexedDb.put(id, { auth })
          }

          return props
        } catch (err) {
          throw { err: 'Session persisting failed!' }
        }
      }

      // Wiping IndexedDB completely when using random PIN
      await seaIndexedDb.wipe() // NO! Do not do this. It ruins other people's sessionStorage code. This is bad/wrong, commenting it out.
      // And remove sessionStorage data
      sessionStorage.removeItem('user')
      sessionStorage.removeItem('remember')

      return props
    }
    module.exports = updateStorage
  