
import Gun = require('../../index');


//Documentation should work

const gun = Gun()
gun.on('auth', data => {

})

gun.user().auth("a","b")
async () => gun.user().auth(await Gun.SEA.pair())