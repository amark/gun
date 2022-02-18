//import { expectError } from 'tsd';

import Gun from '../..';

//Documentation should work

type User = { name: string };

const gun = new Gun<{ user: User; user2: User }>();
gun.get('user').put({ name: '' });
gun.get('user').get('name').put(gun.get('user').get('name'));
gun.get('user2').put(gun.get('user'));
