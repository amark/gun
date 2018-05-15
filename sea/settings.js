
    const Buffer = require('./buffer')
    const settings = {}
    // Encryption parameters
    const pbkdf2 = { hash: 'SHA-256', iter: 100000, ks: 64 }

    const ecdsaSignProps = { name: 'ECDSA', hash: { name: 'SHA-256' } }
    const ecdsaKeyProps = { name: 'ECDSA', namedCurve: 'P-256' }
    const ecdhKeyProps = { name: 'ECDH', namedCurve: 'P-256' }

    const _initial_authsettings = {
      validity: 12 * 60 * 60, // internally in seconds : 12 hours
      hook: (props) => props  // { iat, exp, alias, remember }
      // or return new Promise((resolve, reject) => resolve(props)
    }
    // These are used to persist user's authentication "session"
    const authsettings = Object.assign({}, _initial_authsettings)
    // This creates Web Cryptography API compliant JWK for sign/verify purposes
    const keysToEcdsaJwk = (pub, d) => {  // d === priv
      //const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':') // old
      const [ x, y ] = pub.split('.') // new
      var jwk = { kty: "EC", crv: "P-256", x: x, y: y, ext: true }
      jwk.key_ops = d ? ['sign'] : ['verify'];
      if(d){ jwk.d = d }
      return jwk;
    }

    Object.assign(settings, {
      pbkdf2,
      ecdsa: {
        pair: ecdsaKeyProps,
        sign: ecdsaSignProps
      },
      ecdh: ecdhKeyProps,
      jwk: keysToEcdsaJwk,
      recall: authsettings
    })
    module.exports = settings
  