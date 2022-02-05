import Gun from '../..';

const gun = Gun();
const user = gun.get('alice').put({ name: 'Alice' });
gun.get('users').set('sa');
gun.get('users').set(user);
