import Gun = require('../../index');

Gun().get('users').map(user => user.name === 'Mark'? user : undefined)