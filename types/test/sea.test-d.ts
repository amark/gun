import Gun from '../..';

const SEA = Gun.SEA;
(async () => {
  const pair = await SEA.pair();
  let enc = await SEA.encrypt('hello self', pair);
  const data = await SEA.sign(enc, pair);
  console.log(data);
  const msg = await SEA.verify(data, pair.pub);
  const dec = await SEA.decrypt(msg, pair);
  const proof = await SEA.work(dec, pair);
  const check = await SEA.work('hello self', pair);
  console.log(dec);
  console.log(proof === check);
  // now let's share private data with someone:
  const alice = await SEA.pair();
  const bob = await SEA.pair();
  enc = await SEA.encrypt('shared data', await SEA.secret(bob.epub, alice));
  await SEA.decrypt(enc, await SEA.secret(alice.epub, bob));
  // `.secret` is Elliptic-curve Diffie–Hellman
  // Bob allows Alice to write to part of his graph, he creates a certificate for Alice
  const certificate = await SEA.certify(alice.pub, ['^AliceOnly.*'], bob);
  // Alice logs in
  const gun = Gun();
  gun.user().auth(alice);
  // and uses the certificate
  gun
    .get('~' + bob.pub)
    .get('AliceOnly')
    .put({ 'do-not-tell-anyone': enc }, null, { opt: { cert: certificate } });
  gun
    .get('~' + bob.pub)
    .get('AliceOnly')
    .get('do-not-tell-anyone')
    .once(console.log); // return 'enc'
})();
