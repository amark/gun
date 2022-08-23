import Gun from '../..';

const gun = new Gun<{
  peer: { userID: { profile: {} } };
  IoT: { temperature: number };
  something: string;
}>();

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
  gun.put({ something: 'something' });
  gun.get('something').put('something');
});

new Gun().get('something').once<string>(function (data, _key) {
  gun.put({ something: data });
  gun.get('something').put(data);
});
