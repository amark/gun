//import { expectError } from 'tsd';

import Gun from '../..';

//Documentation should work

const gun2 = new Gun();
gun2.get('user').put({ alice: 'asd' });
