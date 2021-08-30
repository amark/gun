// const Gun = require('../..');
// const gun = Gun();

// gun.get('hub').on(data => {
//     console.log(data['/home/noctisatrae/gun/test/hub/index.html'])
// })

const hub = require('../../lib/hub');
hub.watch('/home/noctisatrae/gun/test/hub', {msg: true, hubignore: true})