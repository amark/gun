import Gun = require('../../index');
var gun = Gun();
var user = gun.user().recall({sessionStorage: true});
user.get('mysecrets').secret('string', data => data)