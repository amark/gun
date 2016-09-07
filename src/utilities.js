/**
 * Created by Paul on 9/7/2016.
 */

let Utilities = (Gun, Type) => {
  // ;(function(Type){
  Type.fns = {
    is: function (fn) {
      return (fn instanceof Function) ? true : false
    }
  };
  Type.bi = {
    is: function (b) {
      return (b instanceof Boolean || typeof b == 'boolean') ? true : false
    }
  }
  Type.num = {
    is: function (n) {
      return !Type.list.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0)
    }
  }
  Type.text = {
    is: function (t) {
      return typeof t == 'string' ? true : false
    }
  }
  Type.text.ify = function (t) {
    if (Type.text.is(t)) {
      return t
    }
    if (typeof JSON !== "undefined") {
      return JSON.stringify(t)
    }
    return (t && t.toString) ? t.toString() : t;
  }
  Type.text.random = function (l, c) {
    var s = '';
    l = l || 24; // you are not going to make a 0 length random number, so no need to check type
    c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
    while (l > 0) {
      s += c.charAt(Math.floor(Math.random() * c.length));
      l--
    }
    return s;
  }
  Type.text.match = function (t, o) {
    var r = false;
    t = t || '';
    o = Gun.text.is(o) ? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore uppercase, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
    if (Type.obj.has(o, '~')) {
      t = t.toLowerCase()
    }
    if (Type.obj.has(o, '=')) {
      return t === o['=']
    }
    if (Type.obj.has(o, '*')) {
      if (t.slice(0, o['*'].length) === o['*']) {
        r = true;
        t = t.slice(o['*'].length)
      } else {
        return false
      }
    }
    if (Type.obj.has(o, '!')) {
      if (t.slice(-o['!'].length) === o['!']) {
        r = true
      } else {
        return false
      }
    }
    if (Type.obj.has(o, '+')) {
      if (Type.list.map(Type.list.is(o['+']) ? o['+'] : [o['+']], function (m) {
          if (t.indexOf(m) >= 0) {
            r = true
          } else {
            return true
          }
        })) {
        return false
      }
    }
    if (Type.obj.has(o, '-')) {
      if (Type.list.map(Type.list.is(o['-']) ? o['-'] : [o['-']], function (m) {
          if (t.indexOf(m) < 0) {
            r = true
          } else {
            return true
          }
        })) {
        return false
      }
    }
    if (Type.obj.has(o, '>')) {
      if (t > o['>']) {
        r = true
      } else {
        return false
      }
    }
    if (Type.obj.has(o, '<')) {
      if (t < o['<']) {
        r = true
      } else {
        return false
      }
    }
    function fuzzy(t, f) {
      var n = -1, i = 0, c;
      for (; c = f[i++];) {
        if (!~(n = t.indexOf(c, n + 1))) {
          return false
        }
      }
      return true
    } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
    if (Type.obj.has(o, '?')) {
      if (fuzzy(t, o['?'])) {
        r = true
      } else {
        return false
      }
    } // change name!
    return r;
  }
  Type.list = {
    is: function (l) {
      return (l instanceof Array) ? true : false
    }
  }
  Type.list.slit = Array.prototype.slice;
  Type.list.sort = function (k) { // creates a new sort function based off some field
    return function (A, B) {
      if (!A || !B) {
        return 0
      }
      A = A[k];
      B = B[k];
      if (A < B) {
        return -1
      } else if (A > B) {
        return 1
      }
      else {
        return 0
      }
    }
  }
  Type.list.map = function (l, c, _) {
    return Type.obj.map(l, c, _)
  }
  Type.list.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
  Type.obj = {
    is: function (o) {
      return !o || !o.constructor ? false : o.constructor === Object ? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/) ? false : true
    }
  }
  Type.obj.put = function (o, f, v) {
    return (o || {})[f] = v, o
  }
  Type.obj.del = function (o, k) {
    if (!o) {
      return
    }
    o[k] = null;
    delete o[k];
    return true;
  }
  Type.obj.ify = function (o) {
    if (Type.obj.is(o)) {
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
  Type.obj.copy = function (o) { // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
    return !o ? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
  }
  Type.obj.as = function (b, f, d) {
    return b[f] = b[f] || (arguments.length >= 3 ? d : {})
  }
  Type.obj.has = function (o, t) {
    return o && Object.prototype.hasOwnProperty.call(o, t)
  }
  Type.obj.empty = function (o, n) {
    if (!o) {
      return true
    }
    return Type.obj.map(o, function (v, i) {
      if (n && (i === n || (Type.obj.is(n) && Type.obj.has(n, i)))) {
        return
      }
      if (i) {
        return true
      }
    }) ? false : true;
  }
  Type.obj.map = function (l, c, _) {
    var u, i = 0, ii = 0, x, r, rr, ll, lle, f = Type.fns.is(c),
      t = function (k, v) {
        if (2 === arguments.length) {
          rr = rr || {};
          rr[k] = v;
          return;
        }
        rr = rr || [];
        rr.push(k);
      };
    if (Object.keys && Type.obj.is(l)) {
      ll = Object.keys(l);
      lle = true;
    }
    if (Type.list.is(l) || ll) {
      x = (ll || l).length;
      for (; i < x; i++) {
        ii = (i + Type.list.index);
        if (f) {
          r = lle ? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
          if (r !== u) {
            return r
          }
        } else {
          //if(Type.test.is(c,l[i])){ return ii } // should implement deep equality testing!
          if (c === l[lle ? ll[i] : i]) {
            return ll ? ll[i] : ii
          } // use this for now
        }
      }
    } else {
      for (i in l) {
        if (f) {
          if (Type.obj.has(l, i)) {
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
    return f ? rr : Type.list.index ? 0 : -1;
  }
  Type.time = {};
  Type.time.is = function (t) {
    return t ? t instanceof Date : (+new Date().getTime())
  }
  Type.time.now = (function () {
    var time = Type.time.is, last = -Infinity, n = 0, d = 1000;
    return function () {
      var t = time();
      if (last < t) {
        n = 0;
        return last = t;
      }
      return last = t + ((n += 1) / d);
    }
  }());
  // }(Util));
};

export default Utilities;
