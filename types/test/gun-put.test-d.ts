//import { expectError } from 'tsd';

import Gun = require('../../index');


//Documentation should work

    const gun = new Gun();
    gun.get('user').put('alice')

    const gun2 = new Gun<{user:{alice:string}}>();
    gun2.get('user').put({alice:"asd"})
