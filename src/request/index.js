/**
 * Created by Paul on 9/7/2016.
 */

import createServer from './createServer';

import jsonpx from './jsonp';
import wsx from './ws';

function reServer(res, base) {
  createServer.ing(res, function (res) {
    r(base, null, null, res);
  });
}

let ws = wsx(reServer);
let jsonp = jsonpx(reServer);

function r(base, body, cb, opt) {
  opt = opt || {};
  let o = base.length ? {base: base} : {};
  o.base = opt.base || base;
  o.body = opt.body || body;
  o.headers = opt.headers;
  o.url = opt.url;
  o.WebSocket = r.WebSocket;
  cb = cb || function () { };

  o.base && !ws(o, cb) && jsonp(o, cb);
}

r.createServer = createServer;

export default r;
