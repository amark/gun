
    const Gun = (typeof window !== 'undefined' ? window : global).Gun || require('gun/gun')
    var Buffer = require('./buffer');
    var authsettings = require('./settings');
    var updateStorage = require('./update');
    // This internal func persists User authentication if so configured
    const authPersist = async (user, proof, opts) => {
      // opts = { pin: 'string' }
      // no opts.pin then uses random PIN
      // How this works:
      // called when app bootstraps, with wanted options
      // IF authsettings.validity === 0 THEN no remember-me, ever
      // IF PIN then signed 'remember' to window.sessionStorage and 'auth' to IndexedDB
      const pin = Buffer.from(
        (Gun.obj.has(opts, 'pin') && opts.pin) || Gun.text.random(10),
        'utf8'
      ).toString('base64')

      const { alias } = user || {}
      const { validity: exp } = authsettings      // seconds // @mhelander what is `exp`???

      if (proof && alias && exp) {
        const iat = Math.ceil(Date.now() / 1000)  // seconds
        const remember = Gun.obj.has(opts, 'pin') || undefined  // for hook - not stored
        const props = authsettings.hook({ alias, iat, exp, remember })
        const { pub, epub, sea: { priv, epriv } } = user
        const key = { pub, priv, epub, epriv }
        if (props instanceof Promise) {
          const asyncProps = await props.then()
          return await updateStorage(proof, key, pin)(asyncProps)
        }
        return await updateStorage(proof, key, pin)(props)
      }
      return await updateStorage()({ alias: 'delete' })
    }
    module.exports = authPersist;
  