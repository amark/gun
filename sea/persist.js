
    const SEA = require('./sea');
    const Gun = SEA.Gun;
    const Buffer = require('./buffer')
    const authsettings = require('./settings')
    const updateStorage = require('./update')
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

      const alias = user.alias
      const exp = authsettings.validity      // seconds // @mhelander what is `exp`???

      if (proof && alias && exp) {
        const iat = Math.ceil(Date.now() / 1000)  // seconds
        const remember = Gun.obj.has(opts, 'pin') || undefined  // for hook - not stored
        const props = authsettings.hook({ alias: alias, iat: iat, exp: exp, remember: remember })
        const pub = user.pub
        const epub = user.epub
        const priv = user.sea.priv
        const epriv = user.sea.epriv
        const key = { pub: pub, priv: priv, epub: epub, epriv: epriv }
        if (props instanceof Promise) {
          const asyncProps = await props.then()
          return await updateStorage(proof, key, pin)(asyncProps)
        }
        return await updateStorage(proof, key, pin)(props)
      }
      return await updateStorage()({ alias: 'delete' })
    }
    module.exports = authPersist
  