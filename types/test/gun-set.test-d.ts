import Gun from '../..';

type User = { name: string };

const gun = new Gun<{ users: Record<string, User>; alice: User }>();
const user = gun.get('alice').put({ name: 'Alice' });
gun.get('users').set({ name: 'Bob' });
gun.get('users').set(user).get('name').put('Sally');
