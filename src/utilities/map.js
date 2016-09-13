/**
 * Created by Paul on 9/8/2016.
 */
import Utils from './base';
import List from './definitions/list'
import Obj from './definitions/obj'

export default function (l, c, _) {
  var u, i = 0, ii = 0, x, r, rr, ll, lle, f = Utils.fns.is(c),
    t = function (k, v) {
      if (2 === arguments.length) {
        rr = rr || {};
        rr[k] = v;
        return;
      }
      rr = rr || [];
      rr.push(k);
    };
  if (Object.keys && Obj.is(l)) {
    ll = Object.keys(l);
    lle = true;
  }
  if (List.is(l) || ll) {
    x = (ll || l).length;
    for (; i < x; i++) {
      ii = (i + List.index);
      if (f) {
        r = lle ? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
        if (r !== u) {
          return r
        }
      } else {
        //if(Gun.test.is(c,l[i])){ return ii } // should implement deep equality testing!
        if (c === l[lle ? ll[i] : i]) {
          return ll ? ll[i] : ii
        } // use this for now
      }
    }
  } else {
    for (i in l) {
      if (f) {
        if (Obj.has(l, i)) {
          r = _ ? c.call(_, l[i], i, t) : c(l[i], i, t);
          if (r !== u) {
            return r
          }
        }
      } else {
        //if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
        if (c === l[i]) {
          return i
        } // use this for now
      }
    }
  }
  return f ? rr : List.index ? 0 : -1;
}
