import Gun from '../..';

/*Documentation example*/
async function certify() {
  const SEA = Gun.SEA;
  const gun = Gun();
  const user = gun.user();
  var Alice = await SEA.pair();
  var AliceHusband = await SEA.pair();
  var Bob = await SEA.pair();
  var Dave = await SEA.pair();

  // Alice wants to allow Bob and Dave to use write to her "inbox" and "stories" UNTIL TOMORROW
  // On Alice's side:
  var certificate = await SEA.certify(
    [Bob.pub, Dave.pub],
    [{ '*': 'inbox', '+': '*' }, { '*': 'stories' }],
    Alice,
    null,
    { expiry: Gun.state() + 60 * 60 * 24 * 1000 }
  );

  // Now on Bob/Dave's side, they can write to Alice's graph using gun.put:
  gun
    .get('~' + Alice.pub)
    .get('inbox')
    .put({ ['deeper' + Bob.pub]: 'hello world' }, null, {
      opt: { cert: certificate },
    }); // {opt: {cert: certificate}} is how you use Certificate in gun.put
}
