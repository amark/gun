;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    // Derive shared secret from other's pub and my epub/epriv 
    SEA.secret = SEA.secret || (async (key, pair, cb, opt) => { try {
      opt = opt || {};
      if(!pair || !pair.epriv || !pair.epub){
        if(!SEA.I){ throw 'No secret mix.' }
        pair = await SEA.I(null, {what: key, how: 'secret', why: opt.why});
      }
      var pub = key.epub || key;
      var epub = pair.epub;
      var epriv = pair.epriv;
      var ecdhSubtle = shim.ossl || shim.subtle;
      var pubKeyData = keysToEcdhJwk(pub);
      var props = Object.assign({ public: await ecdhSubtle.importKey(...pubKeyData, true, []) },{name: 'ECDH', namedCurve: 'P-256'}); // Thanks to @sirpy !
      var privKeyData = keysToEcdhJwk(epub, epriv);
      var derived = await ecdhSubtle.importKey(...privKeyData, false, ['deriveBits']).then(async (privKey) => {
        // privateKey scope doesn't leak out from here!
        var derivedBits = await ecdhSubtle.deriveBits(props, privKey, 256);
        var rawBits = new Uint8Array(derivedBits);
        var derivedKey = await ecdhSubtle.importKey('raw', rawBits,{ name: 'AES-GCM', length: 256 }, true, [ 'encrypt', 'decrypt' ]);
        return ecdhSubtle.exportKey('jwk', derivedKey).then(({ k }) => k);
      })
      var r = derived;
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    /**
     * SEA.share(data, sender, recipients, cb, opt)
     * Zero-knowledge multi-user sharing: encrypt `data` with a fresh random session key,
     * then wrap (encrypt) that session key separately for each recipient using the unique
     * ECDH shared secret derived from the sender's epriv and each recipient's epub.
     * The result is a "capsule" that can be stored anywhere (Gun graph, relay, file):
     * only the sender and the listed recipients can ever derive the session key.
     * @param {*} data - the plaintext to share (string, object, array, etc.)
     * @param {object} sender - the sender's pair ({pub, priv, epub, epriv}); required.
     * @param {array|object|string} recipients - one or more recipients; each may be a full pair,
     *                                            an object with an `epub`, or a bare epub string.
     * @param {function} [cb] - optional callback `cb(capsule)`; promise returned regardless.
     * @param {object} [opt] - optional options passed through to SEA.encrypt/SEA.secret.
     * @returns {Promise<object>} capsule: { e: senderEpub, s: { [recipientEpub]: wrappedKey }, c: 'SEA{...}' }
     */
    SEA.share = SEA.share || (async (data, sender, recipients, cb, opt) => { try {
      opt = opt || {};
      if(!sender || !sender.epriv || !sender.epub){ throw 'No sender pair (epub/epriv).' }
      if(!recipients){ throw 'No recipients.' }
      if(!Array.isArray(recipients)){ recipients = [recipients] }
      var sessionKey = SEA.random(32).toString('base64'); // fresh AES session key, never leaves the client except wrapped.
      var ct = await SEA.encrypt(data, sessionKey, null, opt); // encrypt payload with the session key.
      var slots = {};
      for(var i = 0; i < recipients.length; i++){
        var r = recipients[i] || {};
        var epub = r.epub || r;
        if(!epub || 'string' !== typeof epub){ continue } // skip invalid recipients.
        var secret = await SEA.secret({epub: epub}, sender, null, opt); // ECDH: sender.epriv + recipient.epub.
        slots[epub] = await SEA.encrypt(sessionKey, secret, null, opt); // wrap session key for this recipient.
      }
      var capsule = { e: sender.epub, s: slots, c: ct };
      if(cb){ try{ cb(capsule) }catch(e){console.log(e)} }
      return capsule;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    /**
     * SEA.unshare(capsule, recipient, cb, opt)
     * The inverse of SEA.share: unwraps the recipient's key slot with the ECDH shared secret
     * derived from the sender's epub (stored in the capsule) and the recipient's own epriv,
     * then decrypts the payload with the recovered session key.
     * A recipient who is not listed in the capsule has no slot and cannot decrypt.
     * @param {object} capsule - capsule produced by SEA.share ({e, s, c}).
     * @param {object} recipient - the recipient's pair ({pub, priv, epub, epriv}); required.
     * @param {function} [cb] - optional callback `cb(data)`; promise returned regardless.
     * @param {object} [opt] - optional options passed through to SEA.decrypt/SEA.secret.
     * @returns {Promise<*>} the decrypted plaintext, or undefined on failure.
     */
    SEA.unshare = SEA.unshare || (async (capsule, recipient, cb, opt) => { try {
      opt = opt || {};
      if(!capsule || !capsule.e || !capsule.s || !capsule.c){ throw 'No capsule ({e, s, c}).' }
      if(!recipient || !recipient.epriv || !recipient.epub){ throw 'No recipient pair (epub/epriv).' }
      var slot = capsule.s[recipient.epub];
      if(!slot){ throw 'Recipient has no key slot in this capsule.' }
      var secret = await SEA.secret({epub: capsule.e}, recipient, null, opt); // ECDH: sender.epub + recipient.epriv.
      var sessionKey = await SEA.decrypt(slot, secret, null, opt); // unwrap the session key.
      var data = await SEA.decrypt(capsule.c, sessionKey, null, opt); // decrypt the payload.
      if(cb){ try{ cb(data) }catch(e){console.log(e)} }
      return data;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    // can this be replaced with settings.jwk?
    var keysToEcdhJwk = (pub, d) => { // d === priv
      //var [ x, y ] = shim.Buffer.from(pub, 'base64').toString('utf8').split(':') // old
      var [ x, y ] = pub.split('.') // new
      var jwk = d ? { d: d } : {}
      return [  // Use with spread returned value...
        'jwk',
        Object.assign(
          jwk,
          { x: x, y: y, kty: 'EC', crv: 'P-256', ext: true }
        ), // ??? refactor
        {name: 'ECDH', namedCurve: 'P-256'}
      ]
    }

    module.exports = SEA.secret;
  
}());