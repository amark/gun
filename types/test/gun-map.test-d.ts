import Gun from '../..';

Gun()
  .get('users')
  .map<{ name: string }>((user) => (user.name === 'Mark' ? user : undefined));
