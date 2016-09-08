/**
 * Created by Paul on 9/8/2016.
 */

import Utils from '../utilities';
import IsRel from '../is/rel';
import IsNode from '../is/node';
import Log from '../console';

export default function (cb, opt) {
  var u, gun = this, chain = gun.chain();
  cb = cb || function () {
    };
  cb.hash = {};
  opt = Utils.bi.is(opt) ? {change: opt} : opt || {};
  opt.change = Utils.bi.is(opt.change) ? opt.change : true;
  function path(err, val, field) {
    if (err || (val === u)) {
      return
    }
    cb.call(this, val, field);
  }

  function each(val, field) {
    //if(!IsRel(val)){ path.call(this.gun, null, val, field);return;}
    if (opt.node) {
      if (!IsRel(val)) {
        return;
      }
    }
    cb.hash[this.soul + field] = cb.hash[this.soul + field] || this.gun.path(field, path, {chain: chain, via: 'map'}); // TODO: path should reuse itself! We shouldn't have to do it ourselves.
    // TODO:
    // 1. Ability to turn off an event. // automatically happens within path since reusing is manual?
    // 2. Ability to pass chain context to fire on. // DONE
    // 3. Pseudoness handled for us. // DONE
    // 4. Reuse. // MANUALLY DONE
  }

  function map(at) {
    var ref = gun.__.by(at.soul).chain || gun;
    IsNode(at.change, each, {gun: ref, soul: at.soul});
  }

  gun.on(map, {raw: true, change: true}); // TODO: ALLOW USER TO DO map change false!
  if (gun === gun.back) {
    Log('You have no context to `.map`!')
  }
  return chain;
};
