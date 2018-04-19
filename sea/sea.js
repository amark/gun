
    // Old Code...
    const {
      crypto,
      subtle,
      ossl,
      random: getRandomBytes,
      TextEncoder,
      TextDecoder
    } = require('./shim')
    const EasyIndexedDB = require('./indexed')
    const Buffer = require('./buffer')
    var settings = require('./settings');
    const {
      pbkdf2: pbKdf2,
      ecdsa: { pair: ecdsaKeyProps, sign: ecdsaSignProps },
      ecdh: ecdhKeyProps,
      jwk: keysToEcdsaJwk
    } = require('./settings')
    const sha1hash = require('./sha1')
    const sha256hash = require('./sha256')
    const recallCryptoKey = require('./remember')
    const parseProps = require('./parse')

    // Practical examples about usage found from ./test/common.js
    const SEA = require('./root');
    SEA.work = require('./work');
    SEA.sign = require('./sign');
    SEA.verify = require('./verify');
    SEA.encrypt = require('./encrypt');
    SEA.decrypt = require('./decrypt');

    SEA.random = getRandomBytes;

    // This is easy way to use IndexedDB, all methods are Promises
    // Note: Not all SEA interfaces have to support this.
    SEA.EasyIndexedDB = EasyIndexedDB;

    // This is Buffer used in SEA and usable from Gun/SEA application also.
    // For documentation see https://nodejs.org/api/buffer.html
    SEA.Buffer = Buffer;

    // These SEA functions support now ony Promises or
    // async/await (compatible) code, use those like Promises.
    //
    // Creates a wrapper library around Web Crypto API
    // for various AES, ECDSA, PBKDF2 functions we called above.
    // Calculate public key KeyID aka PGPv4 (result: 8 bytes as hex string)
    SEA.keyid = async (pub) => {
      try {
        // base64('base64(x):base64(y)') => Buffer(xy)
        const pb = Buffer.concat(
          Buffer.from(pub, 'base64').toString('utf8').split(':')
          .map((t) => Buffer.from(t, 'base64'))
        )
        // id is PGPv4 compliant raw key
        const id = Buffer.concat([
          Buffer.from([0x99, pb.length / 0x100, pb.length % 0x100]), pb
        ])
        const sha1 = await sha1hash(id)
        const hash = Buffer.from(sha1, 'binary')
        return hash.toString('hex', hash.length - 8)  // 16-bit ID as hex
      } catch (e) {
        console.log(e)
        throw e
      }
    }
    // all done!
    // Obviously it is missing MANY necessary features. This is only an alpha release.
    // Please experiment with it, audit what I've done so far, and complain about what needs to be added.
    // SEA should be a full suite that is easy and seamless to use.
    // Again, scroll naer the top, where I provide an EXAMPLE of how to create a user and sign in.
    // Once logged in, the rest of the code you just read handled automatically signing/validating data.
    // But all other behavior needs to be equally easy, like opinionated ways of
    // Adding friends (trusted public keys), sending private messages, etc.
    // Cheers! Tell me what you think.
    var Gun = (SEA.window||{}).Gun || require('./gun');
    Gun.SEA = SEA;
    SEA.Gun = Gun;

    module.exports = SEA
  