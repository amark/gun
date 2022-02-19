import Gun from '../..';

new Gun<{ users: Record<string, { name: string }> }>()
  .get('users')
  .on()
  .map((user) => (user.name === 'Mark' ? user : undefined));

new Gun()
  .get<Record<string, { name: string }>>('users')
  .map((user) => (user.name === 'Mark' ? user : undefined))
  .once((user) => console.log(user.name));
