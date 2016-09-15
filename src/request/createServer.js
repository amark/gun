/**
 * Created by Paul on 9/13/2016.
 */

let s = [];

let createServer = function (fn) {
  s.push(fn)
};

createServer.ing = function (req, cb) {
  let i = s.length;
  while (i--) {
    (s[i] || function () { })(req, cb);
  }
};

export default createServer;
