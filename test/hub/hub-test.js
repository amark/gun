// const Gun = require('../..');
// const gun = Gun();

// gun.get('hub').on(data => {
//     console.log(data[`${__dirname}/index.html`])
// })

const hub = require('../../lib/hub');
hub.watch(__dirname, {msg: true, hubignore: true})