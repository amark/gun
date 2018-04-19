
    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    // Derive shared secret from other's pub and my epub/epriv
    SEA.secret = async (key, pair, cb) => { try {
      const pub = key.epub || key
      const epub = pair.epub
      const epriv = pair.epriv
      const ecdhSubtle = shim.ossl || shim.subtle
      const pubKeyData = keysToEcdhJwk(pub)
      const props = {
        ...S.ecdh,
        public: await ecdhSubtle.importKey(...pubKeyData, true, [])
      }
      const privKeyData = keysToEcdhJwk(epub, epriv)
      const derived = await ecdhSubtle.importKey(...privKeyData, false, ['deriveKey'])
      .then(async (privKey) => {
        // privateKey scope doesn't leak out from here!
        const derivedKey = await ecdhSubtle.deriveKey(props, privKey, { name: 'AES-CBC', length: 256 }, true, [ 'encrypt', 'decrypt' ])
        return ecdhSubtle.exportKey('jwk', derivedKey).then(({ k }) => k)
      })
      const r = derived;
      if(cb){ cb(r) }
      return r;
    } catch(e) { 
      SEA.err = e;
      if(cb){ cb() }
      return;
    }}

    const keysToEcdhJwk = (pub, d) => { // d === priv
      //const [ x, y ] = Buffer.from(pub, 'base64').toString('utf8').split(':') // old
      const [ x, y ] = pub.split('.') // new
      const jwk = d ? { d } : {}
      return [  // Use with spread returned value...
        'jwk',
        { ...jwk, x, y, kty: 'EC', crv: 'P-256', ext: true }, // ??? refactor
        S.ecdh
      ]
    }

    module.exports = SEA.secret;
  