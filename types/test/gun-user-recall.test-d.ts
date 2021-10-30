import Gun = require('../../index');
var gun = Gun();
var user = gun.user().recall({sessionStorage: true});