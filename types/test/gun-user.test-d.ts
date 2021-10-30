import Gun = require('../../index');
var gun = Gun();
gun.user("publicKey").once(console.log)