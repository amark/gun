import Gun = require('../../index');

/*Documentation example*/
async function certify(){
    const SEA = Gun.SEA;
    const gun = Gun();
    const user = gun.user();
    var Alice = await SEA.pair()
    var AliceHusband = await SEA.pair()
    var Bob = await SEA.pair()
    var Dave = await SEA.pair()
    
    // Alice wants to allow Bob and Dave to use write to her "inbox" and "stories" UNTIL TOMORROW
    // On Alice's side:
    var certificate = await SEA.certify([Bob.pub, Dave.pub], [{"*": "inbox", "+": "*"}, {"*": "stories"}], Alice, null, {expiry: Gun.state()+(60*60*24*1000), blacklist: 'blacklist'})
    
    // Now on Bob/Dave's side, they can write to Alice's graph using gun.put:
    gun.get('~'+Alice.pub).get('inbox').get('deeper'+Bob.pub).put('hello world', null, {opt: {cert: certificate}}) // {opt: {cert: certificate}} is how you use Certificate in gun.put
    
    // Now Alice wants to revoke access of Bob. She has TWO OPTIONS. OPTION 1 is to manage the blacklist by herself.
    user.get('blacklist').get(Bob.pub).put(true) // OPTION 1: She directly manages her blacklist, in her graph.
    
    // OPTION 2: Alice could point the blacklist to her husband's graph:
    user.get('blacklist').put({'#': '~'+AliceHusband.pub+'/blacklist'})
    
    // Now on AliceHusband's side, HE can add Bob to his blacklist:
    user.get('blacklist').get(Bob.pub).put(true)

}