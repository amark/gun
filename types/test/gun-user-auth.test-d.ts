import Gun from '../..';

//Documentation should work

const gun = new Gun();
gun.on('auth', (_data) => {});

gun.user().auth('a', 'b');
async () => gun.user().auth(await Gun.SEA.pair());
