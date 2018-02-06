
    var Buffer = require('./buffer');
    var sha256hash = require('./sha256');
    var wc = require('./webcrypto');
    var subtle = wc.subtle;
    var seaIndexedDb = require('./indexed').scope;
    var settings = require('./settings');
    var authsettings = settings.recall;
    const makeKey = async (p, s) => {
      const ps = Buffer.concat([Buffer.from(p, 'utf8'), s]).toString('utf8')
      return Buffer.from(await sha256hash(ps), 'binary')
    }
    // This recalls Web Cryptography API CryptoKeys from IndexedDB or creates & stores
    // {pub, key}|proof, salt, optional:['sign']
    const recallCryptoKey = async (p, s, o = [ 'encrypt', 'decrypt' ]) => {
      const importKey = async (key) => {
        const hashedKey = await makeKey((Gun.obj.has(key, 'key') && key.key) || key, s || getRandomBytes(8))
        return await subtle.importKey(
          'raw',
          new Uint8Array(hashedKey),
          'AES-CBC',
          false,
          o
        )
      }

      if (authsettings.validity && typeof window !== 'undefined'
      && Gun.obj.has(p, 'pub') && Gun.obj.has(p, 'key')) {
        const { pub: id } = p
        const importAndStoreKey = async () => {
          const key = await importKey(p)
          await seaIndexedDb.put(id, { key })
          return key
        }
        if (Gun.obj.has(p, 'set')) {
          return importAndStoreKey()  // proof update so overwrite
        }
        const aesKey = await seaIndexedDb.get(id, 'key')
        return aesKey ? aesKey : importAndStoreKey()
      }

      // No secure store usage
      return importKey(p)
    }
    module.exports = recallCryptoKey;
  