(function() {
  var array_intersection, crypto, escapable, lookup, rbytes, unroll_lookup;

  crypto = require('crypto');

  try {
    rbytes = require('rbytes');
  } catch (x) {

  }

  exports.array_intersection = array_intersection = function(arr_a, arr_b) {
    var a, r, _i, _len;
    r = [];
    for (_i = 0, _len = arr_a.length; _i < _len; _i++) {
      a = arr_a[_i];
      if (arr_b.indexOf(a) !== -1) r.push(a);
    }
    return r;
  };

  exports.escape_selected = function(str, chars) {
    var c, i, map, parts, r, v, _i, _len, _ref;
    map = {};
    chars = '%' + chars;
    for (_i = 0, _len = chars.length; _i < _len; _i++) {
      c = chars[_i];
      map[c] = escape(c);
    }
    r = new RegExp('([' + chars + '])');
    parts = str.split(r);
    for (i = 0, _ref = parts.length; 0 <= _ref ? i < _ref : i > _ref; 0 <= _ref ? i++ : i--) {
      v = parts[i];
      if (v.length === 1 && v in map) parts[i] = map[v];
    }
    return parts.join('');
  };

  exports.buffer_concat = function(buf_a, buf_b) {
    var dst;
    dst = new Buffer(buf_a.length + buf_b.length);
    buf_a.copy(dst);
    buf_b.copy(dst, buf_a.length);
    return dst;
  };

  exports.md5_hex = function(data) {
    return crypto.createHash('md5').update(data).digest('hex');
  };

  exports.sha1_base64 = function(data) {
    return crypto.createHash('sha1').update(data).digest('base64');
  };

  exports.timeout_chain = function(arr) {
    var fun, timeout, user_fun, _ref,
      _this = this;
    arr = arr.slice(0);
    if (!arr.length) return;
    _ref = arr.shift(), timeout = _ref[0], user_fun = _ref[1];
    fun = function() {
      user_fun();
      return exports.timeout_chain(arr);
    };
    return setTimeout(fun, timeout);
  };

  exports.objectExtend = function(dst, src) {
    var k;
    for (k in src) {
      if (src.hasOwnProperty(k)) dst[k] = src[k];
    }
    return dst;
  };

  exports.overshadowListeners = function(ee, event, handler) {
    var new_handler, old_listeners;
    old_listeners = ee.listeners(event).slice(0);
    ee.removeAllListeners(event);
    new_handler = function() {
      var listener, _i, _len;
      if (handler.apply(this, arguments) !== true) {
        for (_i = 0, _len = old_listeners.length; _i < _len; _i++) {
          listener = old_listeners[_i];
          listener.apply(this, arguments);
        }
        return false;
      }
      return true;
    };
    return ee.addListener(event, new_handler);
  };

  escapable = /[\x00-\x1f\ud800-\udfff\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufff0-\uffff]/g;

  unroll_lookup = function(escapable) {
    var c, i, unrolled;
    unrolled = {};
    c = (function() {
      var _results;
      _results = [];
      for (i = 0; i < 65536; i++) {
        _results.push(String.fromCharCode(i));
      }
      return _results;
    })();
    escapable.lastIndex = 0;
    c.join('').replace(escapable, function(a) {
      return unrolled[a] = '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    });
    return unrolled;
  };

  lookup = unroll_lookup(escapable);

  exports.quote = function(string) {
    var quoted;
    quoted = JSON.stringify(string);
    escapable.lastIndex = 0;
    if (!escapable.test(quoted)) return quoted;
    return quoted.replace(escapable, function(a) {
      return lookup[a];
    });
  };

  exports.parseCookie = function(cookie_header) {
    var cookie, cookies, parts, _i, _len, _ref;
    cookies = {};
    if (cookie_header) {
      _ref = cookie_header.split(';');
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        cookie = _ref[_i];
        parts = cookie.split('=');
        cookies[parts[0].trim()] = (parts[1] || '').trim();
      }
    }
    return cookies;
  };

  exports.random32 = function() {
    var foo, v;
    if (rbytes) {
      foo = rbytes.randomBytes(4);
      v = [foo[0], foo[1], foo[2], foo[3]];
    } else {
      foo = function() {
        return Math.floor(Math.random() * 256);
      };
      v = [foo(), foo(), foo(), foo()];
    }
    return v[0] + (v[1] * 256) + (v[2] * 256 * 256) + (v[3] * 256 * 256 * 256);
  };

}).call(this);
