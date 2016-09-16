/**
 * Created by Paul on 9/8/2016.
 */
import Text from '../utilities/text';
import List from '../utilities/list';
import Obj from '../utilities/obj';
import Utils from '../utilities/base';
import Events from '../events';

export default function (opt, stun) {
  opt = opt || {};
  let gun = this, root = (gun.__ && gun.__.gun) ? gun.__.gun : (gun._ = gun.__ = {gun: gun}).gun.chain(); // if root does not exist, then create a root chain.
  root.__.by = root.__.by || function (f) {
      return gun.__.by[f] = gun.__.by[f] || {};
    };
  root.__.graph = root.__.graph || {};
  root.__.opt = root.__.opt || {peers: {}};
  root.__.opt.wire = root.__.opt.wire || {};
  if (Text.is(opt)) {
    opt = {peers: opt};
  }
  if (List.is(opt)) {
    opt = {peers: opt};
  }
  if (Text.is(opt.peers)) {
    opt.peers = [opt.peers];
  }
  if (List.is(opt.peers)) {
    opt.peers = Obj.map(opt.peers, function (n, f, m) {
      m(n, {});
    })
  }
  Obj.map(opt.peers, function (v, f) {
    root.__.opt.peers[f] = v;
  });
  Obj.map(opt.wire, function (h, f) {
    if (!Utils.fns.is(h)) {
      return;
    }
    root.__.opt.wire[f] = h;
  });
  Obj.map(['key', 'on', 'path', 'map', 'not', 'init'], function (f) {
    if (!opt[f]) {
      return;
    }
    root.__.opt[f] = opt[f] || root.__.opt[f];
  });
  if (!stun) {
    Events('opt').emit(root, opt);
  }
  return gun;
};
