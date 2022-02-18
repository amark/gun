import Gun from '../..';

new Gun();
new Gun(['http://server1.com/gun', 'http://server2.com/gun']);
new Gun({
  s3: {
    key: '',
    secret: '',
    bucket: '',
  },
  file: 'file/path.json',
  uuid() {
    return 'xxxxxx';
  },
});
