import Gun = require('../../index');
const gun = Gun()
var user = gun.get('alice').put({name: "Alice"})
gun.get('users').set("sa");