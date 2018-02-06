
    var Buffer = require('./buffer');
    var settings = {};
    // Encryption parameters
    const pbKdf2 = { hash: 'SHA-256', iter: 50000, ks: 64 }

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
    const keysToEcdsaJwk = (pub, priv) => {
      const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':')
      const jwk = priv ? { d: priv, key_ops: ['sign'] } : { key_ops: ['verify'] }
      return [  // Use with spread returned value...
        'jwk',
        Object.assign(jwk, { x, y, kty: 'EC', crv: 'P-256', ext: false })
      ]
    }

    settings.pbkdf2 = pbKdf2;
    settings.ecdsa = {};
    settings.ecdsa.pair = ecdsaKeyProps;
    settings.ecdsa.sign = ecdsaSignProps;
    settings.ecdh = ecdhKeyProps;
    settings.jwk = keysToEcdsaJwk;
    settings.recall = authsettings;
    module.exports = settings;
  