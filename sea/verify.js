;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');
    var sha = require('./sha256');
    var u;

    SEA.verify = SEA.verify || (async (data, pair, cb, opt) => { try {
      var json = await S.parse(data);
      if(false === pair){ // don't verify!
        var raw = await S.parse(json.m);
        if(cb){ try{ cb(raw) }catch(e){} }
        return raw;
      }
      opt = opt || {};
      // SEA.I // verify is free! Requires no user permission.
      var pub = pair.pub || pair;
      
      // Extract and process the coordinates
      var [x, y] = pub.split('.');
      
      // Create proper JWK format
      var jwk = {
        kty: 'EC',
        crv: 'P-256',
        x: x,
        y: y,
        ext: true,
        key_ops: ['verify']
      };
      
      var key = await (shim.ossl || shim.subtle).importKey('jwk', jwk, 
        {name: 'ECDSA', namedCurve: 'P-256'}, 
        false, 
        ['verify']
      );

      var hash = await sha(json.m);
      
      var buf, sig, check; try{
        buf = shim.Buffer.from(json.s, opt.encode || 'base64'); // NEW DEFAULT!
        sig = new Uint8Array(buf);

        // Handle WebAuthn signature differently
        if(json.a && json.c){
          // Convert authenticator from base64 to buffer
          const authenticator = new Uint8Array(shim.Buffer.from(json.a, 'base64'));
          
          // Handle clientDataJSON correctly
          const client = shim.Buffer.from(json.c, 'base64').toString('utf8');

          // Verify the challenge matches our data
          const message = new TextEncoder().encode(json.m);
          const expected = btoa(String.fromCharCode(...new Uint8Array(message))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
          
          if (JSON.parse(client).challenge !== expected) {
            throw "Challenge verification failed";
          }

          // Hash the client data JSON with SHA-256
          const hash = await (shim.ossl || shim.subtle).digest(
            {name: 'SHA-256'},
            new TextEncoder().encode(client)
          );

          // Concatenate authenticator data and client data hash correctly
          const signed = new Uint8Array(authenticator.length + hash.byteLength);
          signed.set(authenticator);
          signed.set(new Uint8Array(hash), authenticator.length);

          // Parse DER signature more carefully
          const der = sig;
          if (der[0] !== 0x30) {
            throw "Invalid DER signature format";
          }

          let offset = 2;
          let rLength = der[offset + 1];
          offset += 2;

          // Handle potential padding
          if (der[offset] === 0x00) {
            offset++;
            rLength--;
          }

          const r = new Uint8Array(32).fill(0);
          r.set(der.slice(offset, offset + rLength), 32 - rLength);
          
          offset += rLength;
          let sLength = der[offset + 1];
          offset += 2;

          // Handle potential padding
          if (der[offset] === 0x00) {
            offset++;
            sLength--;
          }

          const s = new Uint8Array(32).fill(0);
          s.set(der.slice(offset, offset + sLength), 32 - sLength);

          // Combine r and s into 64-byte signature
          const raw = new Uint8Array(64);
          raw.set(r);
          raw.set(s, 32);

          // Verify the signature
          check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key,raw,signed);
        } else {
          check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash));
        }
        if(!check){ throw "Signature did not match." }
      }catch(e){
        if(SEA.opt.fallback){
          return await SEA.opt.fall_verify(data, pair, cb, opt);
        }
      }
      var r = check? await S.parse(json.m) : u;

      if(cb){ try{ cb(r) }catch(e){} }
      return r;
    } catch(e) {
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.verify;
    // legacy & ossl memory leak mitigation:

    var knownKeys = {};
    var keyForPair = SEA.opt.slow_leak = pair => {
      if (knownKeys[pair]) return knownKeys[pair];
      var jwk = S.jwk(pair);
      knownKeys[pair] = (shim.ossl || shim.subtle).importKey("jwk", jwk, {name: 'ECDSA', namedCurve: 'P-256'}, false, ["verify"]);
      return knownKeys[pair];
    };

    var O = SEA.opt;
    SEA.opt.fall_verify = async function(data, pair, cb, opt, f){
      if(f === SEA.opt.fallback){ throw "Signature did not match" } f = f || 1;
      var tmp = data||'';
      data = SEA.opt.unpack(data) || data;
      var json = await S.parse(data), pub = pair.pub || pair, key = await SEA.opt.slow_leak(pub);
      var hash = (f <= SEA.opt.fallback)? shim.Buffer.from(await shim.subtle.digest({name: 'SHA-256'}, new shim.TextEncoder().encode(await S.parse(json.m)))) : await sha(json.m); // this line is old bad buggy code but necessary for old compatibility.
      var buf; var sig; var check; try{
        buf = shim.Buffer.from(json.s, opt.encode || 'base64') // NEW DEFAULT!
        sig = new Uint8Array(buf)
        check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash))
        if(!check){ throw "Signature did not match." }
      }catch(e){ try{
        buf = shim.Buffer.from(json.s, 'utf8') // AUTO BACKWARD OLD UTF8 DATA!
        sig = new Uint8Array(buf)
        check = await (shim.ossl || shim.subtle).verify({name: 'ECDSA', hash: {name: 'SHA-256'}}, key, sig, new Uint8Array(hash))
        }catch(e){
        if(!check){ throw "Signature did not match." }
        }
      }
      var r = check? await S.parse(json.m) : u;
      O.fall_soul = tmp['#']; O.fall_key = tmp['.']; O.fall_val = data; O.fall_state = tmp['>'];
      if(cb){ try{ cb(r) }catch(e){console.log(e)} }
      return r;
    }
    SEA.opt.fallback = 2;
  
}());