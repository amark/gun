import Gun from '../..';

const gun = Gun();
let view: any;
gun
  .get('peer')
  .get('userID')
  .get('profile')
  .once(function (profile) {
    // render it, but only once. No updates.
    view.show.user(profile);
  });

gun
  .get('IoT')
  .get('temperature')
  .once(function (number) {
    view.show.temp(number);
  });

gun.get('something').once(function (_data, _key) {
  gun.get('something').put({ something: 'something' });
});
