/**
 * Created by Paul on 9/7/2016.
 */

import jsonp from './jsonp';
import ws from './ws';

function r(base, body, cb, opt) {
  opt = opt || {};
  var o = base.length ? {base: base} : {};
  o.base = opt.base || base;
  o.body = opt.body || body;
  o.headers = opt.headers;
  o.url = opt.url;
  cb = cb || function () {
    };
  if (!o.base) {
    return
  }
  r.transport(o, cb);
}

r.createServer = function (fn) {
  r.createServer.s.push(fn)
};
r.createServer.ing = function (req, cb) {
  var i = r.createServer.s.length;
  while (i--) {
    (r.createServer.s[i] || function () {
    })(req, cb)
  }
};
r.createServer.s = [];

r.transport = function (opt, cb) {
  //Gun.log("TRANSPORT:", opt);
  if (r.ws(opt, cb)) {
    return
  }
  r.jsonp(opt, cb);
};

function reServer(res, base) {
  r.createServer.ing(res, function (res) {
    r(base, null, null, res)
  });
}


r.ws = ws(reServer);
r.jsonp = jsonp(reServer);


export default r;
