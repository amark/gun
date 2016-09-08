/**
 * Created by Paul on 9/7/2016.
 */

import Events from '../events';
import Obj from '../utilities/obj';
import Reserved from '../reserved';

let Bindings = function () {
  Events('get.wire').event(function (gun, ctx) {
    if (!ctx.soul) {
      return
    }
    var end;
    (end = gun.__.by(ctx.soul)).end = (end.end || -1); // TODO: CLEAN UP! This should be per peer!
  }, -999);
  Events('wire.get').event(function (gun, ctx, err, data) {
    if (err || !ctx.soul) {
      return
    }
    if (data && !Obj.empty(data, Reserved.meta)) {
      return
    }
    var end = gun.__.by(ctx.soul);
    end.end = (!end.end || end.end < 0) ? 1 : end.end + 1;
  }, -999);
}

export default Bindings;
