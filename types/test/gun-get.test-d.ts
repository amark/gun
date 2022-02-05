//import { expectError } from 'tsd';

import Gun from '../..';

//Documentation should work

async function get() {
  const gun = new Gun();
  gun.get('user').get('alice');
  gun.get<{ alice: string }>('user');
}
