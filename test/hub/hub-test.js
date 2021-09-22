const Gun = require('../..');
const gun = Gun();

gun.get('hub').on(data => {
    console.log(data)
})

const hub = require('../../lib/hub');
hub.watch(__dirname, {msg: true, hubignore: true, alias:require('os').userInfo().username})