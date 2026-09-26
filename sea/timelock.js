;(function(){

    var SEA = require('./root');
    var shim = require('./shim');
    var S = require('./settings');

    // Sequential SHA-256 hash chain: h(0) = salt:seed, h(i+1) = SHA256(h(i)).
    // Computing h(rounds) requires `rounds` sequential hashes: inherently
    // non-parallelizable, so `rounds` is a real lower bound on unlock time.
    var chain = async function(seed, salt, rounds, opt){
      var subtle = shim.ossl || shim.subtle;
      var enc = new shim.TextEncoder();
      var h = salt + ':' + seed;
      for(var i = 0; i < rounds; i++){
        var buf = await subtle.digest('SHA-256', enc.encode(h));
        h = shim.Buffer.from(buf).toString('hex');
      }
      return h;
    };

    /**
     * SEA.timelock(data, pair, cb, opt)
     * Time-locked encryption with an embedded sequential proof-of-work puzzle
     * (Rivest-style hash chain): the payload is encrypted with a key that is the
     * endpoint of a SHA-256 chain of length `opt.rounds`, and only the chain's
     * starting `seed` is published. No one — including the creator — can decrypt
     * before performing `rounds` sequential hashes, and the puzzle cannot be
     * parallelized or shortcut.
     *
     * Dead-man's switch: set `opt.until` to a future timestamp and re-publish a
     * fresh capsule (new `until`, new `seed`) on each heartbeat; when heartbeats
     * stop, the last published capsule becomes unlockable by anyone after its
     * `until` passes. `until` is advisory metadata consumed by executors/release
     * agents; the cryptographic time-lock is `opt.rounds`.
     *
     * @param {*} data - the plaintext to lock (string, object, array, etc.)
     * @param {object} [pair] - optional pair; if given, the capsule metadata is signed
     *                          ({pub, sig}) so it cannot be tampered with undetected.
     * @param {function} [cb] - optional callback `cb(capsule)`; promise returned regardless.
     * @param {object} [opt] - { rounds, until, salt, seed }; rounds defaults to 100000
     *                         (≈ a few seconds), until defaults to 0 (no release time).
     * @returns {Promise<object>} capsule: { until, rounds, salt, seed, c, pub?, sig? }
     */
    SEA.timelock = SEA.timelock || (async (data, pair, cb, opt) => { try {
      opt = opt || {};
      var rounds = parseInt(opt.rounds, 10) || 100000;
      if(!(rounds > 0)){ throw 'Invalid rounds.' }
      var until = parseFloat(opt.until) || 0;
      var salt = opt.salt || SEA.random(16).toString('base64');
      var seed = opt.seed || SEA.random(32).toString('base64');
      var chainKey = await chain(seed, salt, rounds, opt); // creator pays the cost once.
      var c = await SEA.encrypt(data, chainKey, null, opt);
      var capsule = { until: until, rounds: rounds, salt: salt, seed: seed, c: c };
      if(pair && pair.priv){
        capsule.pub = pair.pub;
        capsule.sig = await SEA.sign([until, rounds, salt, seed].join('|'), pair, null, opt); // canonical, serialization-order independent payload
      }
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
     * SEA.timelock.unlock(capsule, cb, opt)
     * The inverse of SEA.timelock: solves the sequential hash-chain puzzle by
     * recomputing `capsule.rounds` hashes from `capsule.seed`, then decrypts.
     * Verifies the capsule's signature (if present) before doing the work.
     * @param {object} capsule - capsule produced by SEA.timelock.
     * @param {function} [cb] - optional callback `cb(data)`; promise returned regardless.
     * @param {object} [opt] - { max }: refuse capsules whose rounds exceed opt.max
     *                         (anti-DoS; default no limit).
     * @returns {Promise<*>} the decrypted plaintext, or undefined on failure.
     */
    SEA.timelock.unlock = SEA.timelock.unlock || (async (capsule, cb, opt) => { try {
      opt = opt || {};
      if(!capsule || !capsule.c || !capsule.seed || !capsule.salt || !capsule.rounds){ throw 'No time-lock capsule.' }
      var rounds = parseInt(capsule.rounds, 10);
      if(!(rounds > 0)){ throw 'Invalid rounds.' }
      if(opt.max && rounds > opt.max){ throw 'Rounds exceed opt.max.' }
      if(capsule.sig && capsule.pub){ // verify metadata authenticity before paying the cost.
        var check = [capsule.until, capsule.rounds, capsule.salt, capsule.seed].join('|');
        var signed = await SEA.verify(capsule.sig, capsule.pub, null, opt);
        if(!signed || signed !== check){ throw 'Invalid time-lock signature.' }
      }
      var chainKey = await chain(capsule.seed, capsule.salt, rounds, opt); // the puzzle: rounds sequential hashes.
      var data = await SEA.decrypt(capsule.c, chainKey, null, opt);
      if(cb){ try{ cb(data) }catch(e){console.log(e)} }
      return data;
    } catch(e) {
      console.log(e);
      SEA.err = e;
      if(SEA.throw){ throw e }
      if(cb){ cb() }
      return;
    }});

    module.exports = SEA.timelock;
  
}());