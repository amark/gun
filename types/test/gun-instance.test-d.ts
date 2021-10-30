import Gun = require('../../index');

Gun()
Gun(['http://server1.com/gun', 'http://server2.com/gun']);
Gun({
  s3: {
    key: '',
    secret: '',
    bucket: ''
  },
  file: 'file/path.json',
  uuid() {
    return 'xxxxxx';
  }
});