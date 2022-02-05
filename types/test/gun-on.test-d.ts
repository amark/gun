import Gun from '../..';

const gun = Gun();
var listenerHandler = (_value, _key, _msg, _ev) => {};

// add listener to foo
gun.get('foo').on(listenerHandler, true);

// remove listener to foo
gun.get('foo').off();

gun
  .get('users')
  .get('username')
  .on<{ online: boolean }>(function (user) {
    // update in real-time
    if (user.online) {
    } else {
    }
  });

gun.get('home').get('lights').on(listenerHandler, true);
