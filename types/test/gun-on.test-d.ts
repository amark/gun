import Gun from '../..';

type TOnlinable = { online: boolean };

const gun = new Gun<{
  users: Record<string, TOnlinable>;
  foo: TOnlinable;
  home: { lights: TOnlinable };
}>();

var listenerHandler = (_value, _key, _msg, _ev) => {};

// add listener to foo
gun.get('foo').on(listenerHandler, true);

// remove listener to foo
gun.get('foo').off();

gun
  .get('users')
  .get('username')
  .on(function (user) {
    // update in real-time
    if (user.online) {
    } else {
    }
  });

gun.get('home').get('lights').on(listenerHandler, true);

new Gun()
  .get('home')
  .get('lights')
  .on<TOnlinable>(function (user) {
    // update in real-time
    if (user.online) {
    } else {
    }
  });
