
    const authsettings = require('./settings')
    const SEA = require('./sea');
    const Gun = SEA.Gun;
    //const { scope: seaIndexedDb } = require('./indexed')
    // This updates sessionStorage & IndexedDB to persist authenticated "session"
    const updateStorage = (proof, key, pin) => async (props) => {
      if (!Gun.obj.has(props, 'alias')) {
        return  // No 'alias' - we're done.
      }
      if (authsettings.validity && proof && Gun.obj.has(props, 'iat')) {
        props.proof = proof
        delete props.remember   // Not stored if present

        const alias = props.alias
        const id = props.alias
        const remember = { alias: alias, pin: pin }

        try {
          const signed = await SEA.sign(JSON.stringify(remember), key)

          sessionStorage.setItem('user', alias)
          sessionStorage.setItem('remember', signed)

          const encrypted = await SEA.encrypt(props, pin)

          if (encrypted) {
            const auth = await SEA.sign(encrypted, key)
            await seaIndexedDb.wipe() // NO! Do not do this. It ruins other people's sessionStorage code. This is bad/wrong, commenting it out.
            await seaIndexedDb.put(id, { auth: auth })
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
  