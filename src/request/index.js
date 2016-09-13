/**
 * Created by Paul on 9/7/2016.
 */

import createServer from  './createServer';
// import createRequest from  './createRequest';

function r(base, body, cb, opt) {
  opt = opt || {};
  var o = base.length ? {base: base} : {};
  o.base = opt.base || base;
  o.body = opt.body || body;
  o.headers = opt.headers;
  o.url = opt.url;
  cb = cb || function () { };
  if (!o.base) {
    return;
  }

  //Gun.log("TRANSPORT:", opt);
  if (ws(opt, r, cb)) {
    return;
  }
  jsonp(opt, cb);
}

r.createServer = createServer;

export default r;
