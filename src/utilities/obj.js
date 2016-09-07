/**
 * Created by Paul on 9/7/2016.
 */
import List from './list'

let Obj = {
  is: function (o) {
    return !o || !o.constructor ? false : o.constructor === Object ? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/) ? false : true
  }
}
Obj.put = function (o, f, v) {
  return (o || {})[f] = v, o
}
Obj.del = function (o, k) {
  if (!o) {
    return
  }
  o[k] = null;
  delete o[k];
  return true;
}
Obj.ify = function (o) {
  if (Obj.is(o)) {
    return o
  }
  try {
    o = JSON.parse(o);
  } catch (e) {
    o = {}
  }
  ;
  return o;
}
Obj.copy = function (o) { // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
  return !o ? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
}
Obj.as = function (b, f, d) {
  return b[f] = b[f] || (arguments.length >= 3 ? d : {})
}
Obj.has = function (o, t) {
  return o && Object.prototype.hasOwnProperty.call(o, t)
}
Obj.empty = function (o, n) {
  if (!o) {
    return true
  }
  return Obj.map(o, function (v, i) {
    if (n && (i === n || (Obj.is(n) && Obj.has(n, i)))) {
      return
    }
    if (i) {
      return true
    }
  }) ? false : true;
}
Obj.map = function (l, c, _) {
  var u, i = 0, ii = 0, x, r, rr, ll, lle, f = Gun.fns.is(c),
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


export default Obj;
