/**
 * Created by Paul on 9/7/2016.
 */

import Obj from './obj'
import List from './list'

let Text = {
    is: function (t) {
      return (typeof t == 'string');
    }
  }
Text.ify = function (t) {
    if (Text.is(t)) {
      return t
    }
    if (typeof JSON !== "undefined") {
      return JSON.stringify(t)
    }
    return (t && t.toString) ? t.toString() : t;
  }
Text.random = function (l, c) {
  var s = '';
  l = l || 24; // you are not going to make a 0 length random number, so no need to check type
  c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
  while (l > 0) {
    s += c.charAt(Math.floor(Math.random() * c.length));
    l--
  }
  return s;
}
Text.match = function (t, o) {
  var r = false;
  t = t || '';
  o = Text.is(o) ? {'=': o} : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore uppercase, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
  if (Obj.has(o, '~')) {
    t = t.toLowerCase()
  }
  if (Obj.has(o, '=')) {
    return t === o['=']
  }
  if (Obj.has(o, '*')) {
    if (t.slice(0, o['*'].length) === o['*']) {
      r = true;
      t = t.slice(o['*'].length)
    } else {
      return false
    }
  }
  if (Obj.has(o, '!')) {
    if (t.slice(-o['!'].length) === o['!']) {
      r = true
    } else {
      return false
    }
  }
  if (Obj.has(o, '+')) {
    if (List.map(List.is(o['+']) ? o['+'] : [o['+']], function (m) {
        if (t.indexOf(m) >= 0) {
          r = true
        } else {
          return true
        }
      })) {
      return false
    }
  }
  if (Obj.has(o, '-')) {
    if (List.map(List.is(o['-']) ? o['-'] : [o['-']], function (m) {
        if (t.indexOf(m) < 0) {
          r = true
        } else {
          return true
        }
      })) {
      return false
    }
  }
  if (Obj.has(o, '>')) {
    if (t > o['>']) {
      r = true
    } else {
      return false
    }
  }
  if (Obj.has(o, '<')) {
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
  if (Obj.has(o, '?')) {
    if (fuzzy(t, o['?'])) {
      r = true
    } else {
      return false
    }
  } // change name!
  return r;
}


export default Text;
