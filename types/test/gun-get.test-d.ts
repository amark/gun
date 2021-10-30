//import { expectError } from 'tsd';

import Gun = require('../../index');


//Documentation should work

async function get(){
    const gun = new Gun();
    const alice = await gun.get('user').get('alice')

    const gun2 = new Gun<{user:{alice:string}}>();
    const alice2 = (await gun2.get('user')).alice
}
