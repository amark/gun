/**
 * Created by Paul on 9/13/2016.
 */

let createServer = function (fn) {
  createServer.s.push(fn)
};
createServer.ing = function (req, cb) {
  var i = createServer.s.length;
  while (i--) {
    (createServer.s[i] || function () {
    })(req, cb)
  }
};
createServer.s = [];

export default createServer;
