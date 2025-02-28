;(function(){

    var SEA = require('./root');
    var shim = require('./shim');

    // P-256 curve constants
    const n = BigInt("0xFFFFFFFF00000000FFFFFFFFFFFFFFFFBCE6FAADA7179E84F3B9CAC2FC632551");
    const P = BigInt("0xffffffff00000001000000000000000000000000ffffffffffffffffffffffff");
    const A = BigInt("0xffffffff00000001000000000000000000000000fffffffffffffffffffffffc");
    const G = {
      x: BigInt("0x6b17d1f2e12c4247f8bce6e563a440f277037d812deb33a0f4a13945d898c296"),
      y: BigInt("0x4fe342e2fe1a7f9b8ee7eb4a7c0f9e162bce33576b315ececbb6406837bf51f5")
    };

    // Core ECC functions
    function mod(a, m) { return ((a % m) + m) % m; }
    function modInv(a, p) {
      let t = 0n, nt = 1n, r = p, nr = a % p;
      while (nr !== 0n) {
        const q = r / nr;
        [t, nt] = [nt, t - q * nt];
        [r, nr] = [nr, r - q * nr];
      }
      return mod(t, p);
    }
    function pointAdd(p1, p2) {
      if (p1 === null) return p2; if (p2 === null) return p1;
      if (p1.x === p2.x && mod(p1.y + p2.y, P) === 0n) return null;
      let lambda = p1.x === p2.x && p1.y === p2.y
        ? mod((3n * mod(p1.x ** 2n, P) + A) * modInv(2n * p1.y, P), P)
        : mod((mod(p2.y - p1.y, P)) * modInv(mod(p2.x - p1.x, P), P), P);
      const x3 = mod(lambda ** 2n - p1.x - p2.x, P);
      return { x: x3, y: mod(lambda * mod(p1.x - x3, P) - p1.y, P) };
    }
    function pointMult(k, point) {
      let r = null, a = point;
      while (k > 0n) {
        if (k & 1n) r = pointAdd(r, a);
        a = pointAdd(a, a);
        k >>= 1n;
      }
      return r;
    }

    SEA.pair = SEA.pair || (async (cb, opt) => { try {
      opt = opt || {};
      const subtle = shim.subtle, ecdhSubtle = shim.ossl || subtle;
      let r = {};

      // Helper functions
      const b64ToBI = s => {
        let b64 = s.replace(/-/g, '+').replace(/_/g, '/');
        while (b64.length % 4) b64 += '=';
        return BigInt('0x' + shim.Buffer.from(b64, 'base64').toString('hex'));
      };
      const biToB64 = n => shim.Buffer.from(n.toString(16).padStart(64, '0'), 'hex')
        .toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
      const pubFromPriv = priv => {
        const pub = pointMult(priv, G);
        return biToB64(pub.x) + '.' + biToB64(pub.y);
      };
      const seedToKey = async (seed, salt) => {
        const enc = new shim.TextEncoder();
        const buf = typeof seed === 'string' ? enc.encode(seed).buffer : 
                   seed instanceof ArrayBuffer ? seed : 
                   seed && seed.byteLength !== undefined ? (seed.buffer || seed) : null;
        if (!buf) throw new Error("Invalid seed");
        const combined = new Uint8Array(buf.byteLength + enc.encode(salt).buffer.byteLength);
        combined.set(new Uint8Array(buf), 0);
        combined.set(new Uint8Array(enc.encode(salt).buffer), buf.byteLength);
        const hash = await subtle.digest("SHA-256", combined.buffer);
        let priv = BigInt("0x" + Array.from(new Uint8Array(hash))
          .map(b => b.toString(16).padStart(2, "0")).join("")) % n;
        if (priv <= 0n || priv >= n) priv = (priv + 1n) % n;
        return priv;
      };

      if (opt.priv) {
        const priv = b64ToBI(opt.priv);
        r = { priv: opt.priv, pub: pubFromPriv(priv) };
        if (opt.epriv) {
          r.epriv = opt.epriv;
          r.epub = pubFromPriv(b64ToBI(opt.epriv));
        } else {
          try {
            const dh = await ecdhSubtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
            .then(async k => ({ 
              epriv: (await ecdhSubtle.exportKey('jwk', k.privateKey)).d,
              epub: (await ecdhSubtle.exportKey('jwk', k.publicKey)).x + '.' + 
                    (await ecdhSubtle.exportKey('jwk', k.publicKey)).y
            }));
            r.epriv = dh.epriv; r.epub = dh.epub;
          } catch(e) {}
        }
      } else if (opt.epriv) {
        r = { epriv: opt.epriv, epub: pubFromPriv(b64ToBI(opt.epriv)) };
        if (opt.priv) {
          r.priv = opt.priv;
          r.pub = pubFromPriv(b64ToBI(opt.priv));
        } else {
          const sa = await subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify'])
          .then(async k => ({ 
            priv: (await subtle.exportKey('jwk', k.privateKey)).d,
            pub: (await subtle.exportKey('jwk', k.publicKey)).x + '.' + 
                 (await subtle.exportKey('jwk', k.publicKey)).y
          }));
          r.priv = sa.priv; r.pub = sa.pub;
        }
      } else if (opt.seed) {
        const signPriv = await seedToKey(opt.seed, "-sign");
        const encPriv = await seedToKey(opt.seed, "-encrypt");
        r = {
          priv: biToB64(signPriv), pub: pubFromPriv(signPriv),
          epriv: biToB64(encPriv), epub: pubFromPriv(encPriv)
        };
      } else {
        const sa = await subtle.generateKey({name: 'ECDSA', namedCurve: 'P-256'}, true, ['sign', 'verify'])
        .then(async k => ({ 
          priv: (await subtle.exportKey('jwk', k.privateKey)).d,
          pub: (await subtle.exportKey('jwk', k.publicKey)).x + '.' + 
               (await subtle.exportKey('jwk', k.publicKey)).y
        }));
        r = { pub: sa.pub, priv: sa.priv };
        try {
          const dh = await ecdhSubtle.generateKey({name: 'ECDH', namedCurve: 'P-256'}, true, ['deriveKey'])
          .then(async k => ({ 
            epriv: (await ecdhSubtle.exportKey('jwk', k.privateKey)).d,
            epub: (await ecdhSubtle.exportKey('jwk', k.publicKey)).x + '.' + 
                  (await ecdhSubtle.exportKey('jwk', k.publicKey)).y
          }));
          r.epub = dh.epub; r.epriv = dh.epriv;
        } catch(e) {}
      }

      if(cb) try{ cb(r) }catch(e){ console.log(e) }
      return r;
    } catch(e) {
      SEA.err = e;
      if(SEA.throw) throw e;
      if(cb) cb();
      return;
    }});

    module.exports = SEA.pair;
  
}());