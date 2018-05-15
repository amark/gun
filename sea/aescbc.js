
    var shim = require('./shim');
    var sha256hash = require('./sha256');

    const importGen = async (key, salt) => {
      //const combo = shim.Buffer.concat([shim.Buffer.from(key, 'utf8'), salt || shim.random(8)]).toString('utf8') // old
      const combo = key + (salt || shim.random(8)).toString('utf8'); // new
      const hash = shim.Buffer.from(await sha256hash(combo), 'binary')
      return await shim.subtle.importKey('raw', new Uint8Array(hash), 'AES-CBC', false, ['encrypt', 'decrypt'])
    }
    module.exports = importGen;
  