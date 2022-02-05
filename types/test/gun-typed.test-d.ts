import Gun from '../..';

const gun = Gun();

gun
  .get('a')
  .get('b')
  .get('c')
  .get('d')
  .get('anystring')
  .on<string>((x) => x.startsWith('some'));
