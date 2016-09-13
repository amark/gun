(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define("Gun", [], factory);
	else if(typeof exports === 'object')
		exports["Gun"] = factory();
	else
		root["Gun"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(2), __webpack_require__(11), __webpack_require__(13), __webpack_require__(47), __webpack_require__(14), __webpack_require__(24), __webpack_require__(28), __webpack_require__(16), __webpack_require__(30), __webpack_require__(33)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./reserved'), require('./utilities'), require('./events'), require('./scheduler'), require('./is'), require('./specific'), require('./chaining'), require('./serializer'), require('./console'), require('./bindings'), require('./request'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.reserved, global.utilities, global.events, global.scheduler, global.is, global.specific, global.chaining, global.serializer, global.console, global.bindings, global.request);
	    global.index = mod.exports;
	  }
	})(this, function (module, exports, _reserved, _utilities, _events, _scheduler, _is, _specific, _chaining, _serializer, _console, _bindings, _request) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _scheduler2 = _interopRequireDefault(_scheduler);
	
	  var _is2 = _interopRequireDefault(_is);
	
	  var _chaining2 = _interopRequireDefault(_chaining);
	
	  var _serializer2 = _interopRequireDefault(_serializer);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _request2 = _interopRequireDefault(_request);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/6/2016.
	   */
	
	  function Gun(o) {
	    var gun = this;
	    if (!Gun.is(gun)) {
	      return new Gun(o);
	    }
	    if (Gun.is(o)) {
	      return gun;
	    }
	    return gun.opt(o);
	  }
	
	  Gun.version = 0.3;
	
	  //TODO: for the sake of tests
	
	  Gun._ = _reserved2.default;
	
	  Gun.fns = _utilities.fns;
	  Gun.bi = _utilities.bi;
	  Gun.num = _utilities.num;
	  Gun.text = _utilities.Text;
	  Gun.list = _utilities.List;
	  Gun.obj = _utilities.Obj;
	  Gun.time = _utilities.Time;
	
	  Gun.on = _events2.default;
	
	  Gun.schedule = _scheduler2.default;
	
	  Gun.is = _is2.default;
	
	  // Gun.HAM = HAM;
	  Gun.union = _specific.Union;
	
	  Object.assign(Gun.prototype, _chaining2.default);
	  Gun.chain = Gun.prototype;
	
	  //TODO: tests again
	
	  Gun.ify = _serializer2.default;
	
	  Gun.log = _console2.default;
	
	  //TODO: sucks, why event binding and not direct call?
	
	  Gun.request = _request2.default;
	
	  exports.default = Gun;
	  module.exports = exports['default'];
	});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.reserved = mod.exports;
	  }
	})(this, function (module, exports) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.default = { // some reserved key words, these are not the only ones.
	    meta: '_' // all metadata of the node is stored in the meta property on the node.
	    , soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
	    , field: '.' // a field is a property on a node which points to a value.
	    , state: '>' // other than the soul, we store HAM metadata.
	    , '#': 'soul',
	    '.': 'field',
	    '=': 'value',
	    '>': 'state'
	  };
	  module.exports = exports['default'];
	});

/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(3), __webpack_require__(5), __webpack_require__(9), __webpack_require__(6), __webpack_require__(10)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./base'), require('./text'), require('./list'), require('./obj'), require('./time'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.base, global.text, global.list, global.obj, global.time);
	    global.index = mod.exports;
	  }
	})(this, function (module, exports, _base, _text, _list, _obj, _time) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _time2 = _interopRequireDefault(_time);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var _extends = Object.assign || function (target) {
	    for (var i = 1; i < arguments.length; i++) {
	      var source = arguments[i];
	
	      for (var key in source) {
	        if (Object.prototype.hasOwnProperty.call(source, key)) {
	          target[key] = source[key];
	        }
	      }
	    }
	
	    return target;
	  };
	
	  exports.default = _extends({}, _base2.default, { Text: _text2.default, List: _list2.default, Obj: _obj2.default, Time: _time2.default });
	  module.exports = exports['default'];
	});

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(4)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./definitions/list'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.list);
	    global.base = mod.exports;
	  }
	})(this, function (module, exports, _list) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _list2 = _interopRequireDefault(_list);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var fns = {
	    is: function is(fn) {
	      return fn instanceof Function;
	    }
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	
	  var bi = {
	    is: function is(b) {
	      return b instanceof Boolean || typeof b == 'boolean';
	    }
	  };
	  var num = {
	    is: function is(n) {
	      return !_list2.default.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0);
	    }
	  };
	
	  exports.default = { fns: fns, bi: bi, num: num };
	  module.exports = exports['default'];
	});

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.list = mod.exports;
	  }
	})(this, function (module, exports) {
	  "use strict";
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	
	  var List = {
	    is: function is(l) {
	      return l instanceof Array;
	    }
	  };
	  List.slit = Array.prototype.slice;
	  List.sort = function (k) {
	    // creates a new sort function based off some field
	    return function (A, B) {
	      if (!A || !B) {
	        return 0;
	      }
	      A = A[k];
	      B = B[k];
	      if (A < B) {
	        return -1;
	      } else if (A > B) {
	        return 1;
	      } else {
	        return 0;
	      }
	    };
	  };
	
	  List.index = 1; // change this to 0 if you want non-logical, non-mathematical, non-matrix, non-convenient array notation
	
	  exports.default = List;
	  module.exports = exports["default"];
	});

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(6), __webpack_require__(9)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./obj'), require('./list'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.obj, global.list);
	    global.text = mod.exports;
	  }
	})(this, function (module, exports, _obj, _list) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  var Text = {
	    is: function is(t) {
	      return typeof t == 'string';
	    }
	  };
	  Text.ify = function (t) {
	    if (Text.is(t)) {
	      return t;
	    }
	    if (typeof JSON !== "undefined") {
	      return JSON.stringify(t);
	    }
	    return t && t.toString ? t.toString() : t;
	  };
	  Text.random = function (l, c) {
	    var s = '';
	    l = l || 24; // you are not going to make a 0 length random number, so no need to check type
	    c = c || '0123456789ABCDEFGHIJKLMNOPQRSTUVWXZabcdefghijklmnopqrstuvwxyz';
	    while (l > 0) {
	      s += c.charAt(Math.floor(Math.random() * c.length));
	      l--;
	    }
	    return s;
	  };
	  Text.match = function (t, o) {
	    var r = false;
	    t = t || '';
	    o = Text.is(o) ? { '=': o } : o || {}; // {'~', '=', '*', '<', '>', '+', '-', '?', '!'} // ignore uppercase, exactly equal, anything after, lexically larger, lexically lesser, added in, subtacted from, questionable fuzzy match, and ends with.
	    if (_obj2.default.has(o, '~')) {
	      t = t.toLowerCase();
	    }
	    if (_obj2.default.has(o, '=')) {
	      return t === o['='];
	    }
	    if (_obj2.default.has(o, '*')) {
	      if (t.slice(0, o['*'].length) === o['*']) {
	        r = true;
	        t = t.slice(o['*'].length);
	      } else {
	        return false;
	      }
	    }
	    if (_obj2.default.has(o, '!')) {
	      if (t.slice(-o['!'].length) === o['!']) {
	        r = true;
	      } else {
	        return false;
	      }
	    }
	    if (_obj2.default.has(o, '+')) {
	      if (_list2.default.map(_list2.default.is(o['+']) ? o['+'] : [o['+']], function (m) {
	        if (t.indexOf(m) >= 0) {
	          r = true;
	        } else {
	          return true;
	        }
	      })) {
	        return false;
	      }
	    }
	    if (_obj2.default.has(o, '-')) {
	      if (_list2.default.map(_list2.default.is(o['-']) ? o['-'] : [o['-']], function (m) {
	        if (t.indexOf(m) < 0) {
	          r = true;
	        } else {
	          return true;
	        }
	      })) {
	        return false;
	      }
	    }
	    if (_obj2.default.has(o, '>')) {
	      if (t > o['>']) {
	        r = true;
	      } else {
	        return false;
	      }
	    }
	    if (_obj2.default.has(o, '<')) {
	      if (t < o['<']) {
	        r = true;
	      } else {
	        return false;
	      }
	    }
	    function fuzzy(t, f) {
	      var n = -1,
	          i = 0,
	          c;
	      for (; c = f[i++];) {
	        if (!~(n = t.indexOf(c, n + 1))) {
	          return false;
	        }
	      }
	      return true;
	    } // via http://stackoverflow.com/questions/9206013/javascript-fuzzy-search
	    if (_obj2.default.has(o, '?')) {
	      if (fuzzy(t, o['?'])) {
	        r = true;
	      } else {
	        return false;
	      }
	    } // change name!
	    return r;
	  };
	
	  exports.default = Text;
	  module.exports = exports['default'];
	});

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(7), __webpack_require__(8)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./map'), require('./definitions/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.map, global.obj);
	    global.obj = mod.exports;
	  }
	})(this, function (module, exports, _map, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _map2 = _interopRequireDefault(_map);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  _obj2.default.map = _map2.default;
	
	  exports.default = _obj2.default;
	  module.exports = exports['default'];
	});

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(3), __webpack_require__(4), __webpack_require__(8)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./base'), require('./definitions/list'), require('./definitions/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.base, global.list, global.obj);
	    global.map = mod.exports;
	  }
	})(this, function (module, exports, _base, _list, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (l, c, _) {
	    var u,
	        i = 0,
	        ii = 0,
	        x,
	        r,
	        rr,
	        ll,
	        lle,
	        f = _base2.default.fns.is(c),
	        t = function t(k, v) {
	      if (2 === arguments.length) {
	        rr = rr || {};
	        rr[k] = v;
	        return;
	      }
	      rr = rr || [];
	      rr.push(k);
	    };
	    if (Object.keys && _obj2.default.is(l)) {
	      ll = Object.keys(l);
	      lle = true;
	    }
	    if (_list2.default.is(l) || ll) {
	      x = (ll || l).length;
	      for (; i < x; i++) {
	        ii = i + _list2.default.index;
	        if (f) {
	          r = lle ? c.call(_ || this, l[ll[i]], ll[i], t) : c.call(_ || this, l[i], ii, t);
	          if (r !== u) {
	            return r;
	          }
	        } else {
	          //if(Gun.test.is(c,l[i])){ return ii } // should implement deep equality testing!
	          if (c === l[lle ? ll[i] : i]) {
	            return ll ? ll[i] : ii;
	          } // use this for now
	        }
	      }
	    } else {
	      for (i in l) {
	        if (f) {
	          if (_obj2.default.has(l, i)) {
	            r = _ ? c.call(_, l[i], i, t) : c(l[i], i, t);
	            if (r !== u) {
	              return r;
	            }
	          }
	        } else {
	          //if(a.test.is(c,l[i])){ return i } // should implement deep equality testing!
	          if (c === l[i]) {
	            return i;
	          } // use this for now
	        }
	      }
	    }
	    return f ? rr : _list2.default.index ? 0 : -1;
	  };
	
	  var _base2 = _interopRequireDefault(_base);

	  var _list2 = _interopRequireDefault(_list);

	  var _obj2 = _interopRequireDefault(_obj);

	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }

	  module.exports = exports['default'];
	});

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.obj = mod.exports;
	  }
	})(this, function (module, exports) {
	  "use strict";
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	
	  var Obj = {
	    is: function is(o) {
	      return !o || !o.constructor ? false : o.constructor === Object ? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/) ? false : true;
	    }
	  };
	  Obj.put = function (o, f, v) {
	    return (o || {})[f] = v, o;
	  };
	  Obj.del = function (o, k) {
	    if (!o) {
	      return;
	    }
	    o[k] = null;
	    delete o[k];
	    return true;
	  };
	  Obj.ify = function (o) {
	    if (Obj.is(o)) {
	      return o;
	    }
	    try {
	      o = JSON.parse(o);
	    } catch (e) {
	      o = {};
	    }
	    ;
	    return o;
	  };
	  Obj.copy = function (o) {
	    // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
	    return !o ? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
	  };
	  Obj.as = function (b, f, d) {
	    return b[f] = b[f] || (arguments.length >= 3 ? d : {});
	  };
	  Obj.has = function (o, t) {
	    return o && Object.prototype.hasOwnProperty.call(o, t);
	  };
	  Obj.empty = function (o, n) {
	    if (!o) {
	      return true;
	    }
	    return Obj.map(o, function (v, i) {
	      if (n && (i === n || Obj.is(n) && Obj.has(n, i))) {
	        return;
	      }
	      if (i) {
	        return true;
	      }
	    }) ? false : true;
	  };
	
	  exports.default = Obj;
	  module.exports = exports["default"];
	});

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(7), __webpack_require__(4)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./map'), require('./definitions/list'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.map, global.list);
	    global.list = mod.exports;
	  }
	})(this, function (module, exports, _map, _list) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _map2 = _interopRequireDefault(_map);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	  _list2.default.map = _map2.default;
	
	  exports.default = _list2.default;
	  module.exports = exports['default'];
	});

/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.time = mod.exports;
	  }
	})(this, function (module, exports) {
	  "use strict";
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  var Time = {};
	  Time.is = function (t) {
	    return t ? t instanceof Date : +new Date().getTime();
	  };
	  Time.now = function () {
	    var time = Time.is,
	        last = -Infinity,
	        n = 0,
	        d = 1000;
	    return function () {
	      var t = time();
	      if (last < t) {
	        n = 0;
	        return last = t;
	      }
	      return last = t + (n += 1) / d;
	    };
	  }();
	
	  exports.default = Time;
	  module.exports = exports["default"];
	});

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(9), __webpack_require__(12)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/list'), require('./at'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.list, global.at);
	    global.index = mod.exports;
	  }
	})(this, function (module, exports, _list, _at) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _at2 = _interopRequireDefault(_at);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	  function On() {}
	  On.create = function () {
	    var on = function on(e) {
	      on.event.e = e;
	      on.event.s[e] = on.event.s[e] || [];
	      return on;
	    };
	    on.emit = function (a) {
	      var e = on.event.e,
	          s = on.event.s[e],
	          args = arguments,
	          l = args.length;
	      _list2.default.map(s, function (hear, i) {
	        if (!hear.fn) {
	          s.splice(i - 1, 0);
	          return;
	        }
	        if (1 === l) {
	          hear.fn(a);
	          return;
	        }
	        hear.fn.apply(hear, args);
	      });
	      if (!s.length) {
	        delete on.event.s[e];
	      }
	    };
	    on.event = function (fn, i) {
	      var s = on.event.s[on.event.e];
	      if (!s) {
	        return;
	      }
	      var e = {
	        fn: fn, i: i || 0, off: function off() {
	          return !(e.fn = false);
	        }
	      };
	      return s.push(e), i ? s.sort(sort) : i, e;
	    };
	    on.event.s = {};
	    return on;
	  };
	  var sort = _list2.default.sort('i');
	
	  var Events = On.create();
	
	  Events.create = On.create;
	
	  Events.at = _at2.default;
	
	  exports.default = Events;
	  module.exports = exports['default'];
	});

/***/ },
/* 12 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.obj);
	    global.at = mod.exports;
	  }
	})(this, function (module, exports, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var At = function At(on) {
	    // On event emitter customized for gun.
	    var proxy = function proxy(e) {
	      return proxy.e = e, proxy;
	    };
	    proxy.emit = function (at) {
	      if (at.soul) {
	        at.hash = At.hash(at);
	        //Obj.as(proxy.mem, proxy.e)[at.soul] = at;
	        _obj2.default.as(proxy.mem, proxy.e)[at.hash] = at;
	      }
	      if (proxy.all.cb) {
	        proxy.all.cb(at, proxy.e);
	      }
	      on(proxy.e).emit(at);
	      return {
	        chain: function chain(c) {
	          if (!c || !c._ || !c._.at) {
	            return;
	          }
	          return c._.at(proxy.e).emit(at);
	        }
	      };
	    };
	    proxy.only = function (cb) {
	      if (proxy.only.cb) {
	        return;
	      }
	      return proxy.event(proxy.only.cb = cb);
	    };
	    proxy.all = function (cb) {
	      proxy.all.cb = cb;
	      _obj2.default.map(proxy.mem, function (mem, e) {
	        _obj2.default.map(mem, function (at, i) {
	          cb(at, e);
	        });
	      });
	    };
	    proxy.event = function (cb, i) {
	      i = on(proxy.e).event(cb, i);
	      return _obj2.default.map(proxy.mem[proxy.e], function (at) {
	        i.stat = { first: true };
	        cb.call(i, at);
	      }), i.stat = {}, i;
	    };
	    proxy.map = function (cb, i) {
	      return proxy.event(cb, i);
	    };
	    proxy.mem = {};
	    return proxy;
	  }; /**
	      * Created by Paul on 9/8/2016.
	      */
	
	
	  At.hash = function (at) {
	    return at.at && at.at.soul ? at.at.soul + (at.at.field || '') : at.soul + (at.field || '');
	  };
	
	  At.copy = function (at) {
	    return _obj2.default.del(at, 'hash'), _obj2.default.map(at, function (v, f, t) {
	      t(f, v);
	    });
	  };
	
	  exports.default = At;
	  module.exports = exports['default'];
	});

/***/ },
/* 13 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(9), __webpack_require__(10), __webpack_require__(3)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./utilities/list'), require('./utilities/time'), require('./utilities/base'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.list, global.time, global.base);
	    global.scheduler = mod.exports;
	  }
	})(this, function (module, exports, _list, _time, _base) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _time2 = _interopRequireDefault(_time);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var schedule = function schedule(state, cb) {
	    // maybe use lru-cache?
	    schedule.waiting.push({
	      when: state, event: cb || function () {}
	    });
	    if (schedule.soonest < state) {
	      return;
	    }
	    schedule.set(state);
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	
	  schedule.waiting = [];
	  schedule.soonest = Infinity;
	  schedule.sort = _list2.default.sort('when');
	  schedule.set = function (future) {
	    if (Infinity <= (schedule.soonest = future)) {
	      return;
	    }
	    var now = _time2.default.now(); // WAS time.is() TODO: Hmmm, this would make it hard for every gun instance to have their own version of time.
	    future = future <= now ? 0 : future - now;
	    clearTimeout(schedule.id);
	    schedule.id = setTimeout(schedule.check, future);
	  };
	  schedule.check = function () {
	    var now = _time2.default.now(),
	        soonest = Infinity; // WAS time.is() TODO: Same as above about time. Hmmm.
	    schedule.waiting.sort(schedule.sort);
	    schedule.waiting = _list2.default.map(schedule.waiting, function (wait, i, map) {
	      if (!wait) {
	        return;
	      }
	      if (wait.when <= now) {
	        if (_base2.default.fns.is(wait.event)) {
	          setTimeout(function () {
	            wait.event();
	          }, 0);
	        }
	      } else {
	        soonest = soonest < wait.when ? soonest : wait.when;
	        map(wait);
	      }
	    }) || [];
	    schedule.set(soonest);
	  };
	
	  exports.default = schedule;
	  module.exports = exports['default'];
	});

/***/ },
/* 14 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__(15), __webpack_require__(22)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(exports, require('./union'), require('./ham'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports, global.union, global.ham);
	    global.index = mod.exports;
	  }
	})(this, function (exports, _union, _ham) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.HAM = exports.Union = undefined;
	
	  var _union2 = _interopRequireDefault(_union);
	
	  var _ham2 = _interopRequireDefault(_ham);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.Union = _union2.default;
	  exports.HAM = _ham2.default;
	});

/***/ },
/* 15 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(6), __webpack_require__(16), __webpack_require__(17), __webpack_require__(19), __webpack_require__(23), __webpack_require__(3), __webpack_require__(5), __webpack_require__(9), __webpack_require__(10), __webpack_require__(13), __webpack_require__(22), __webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../reserved'), require('../utilities/obj'), require('../console'), require('../is/node'), require('../is/rel'), require('../is/graph'), require('../utilities/base'), require('../utilities/text'), require('../utilities/list'), require('../utilities/time'), require('../scheduler'), require('../specific/ham'), require('../events'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.reserved, global.obj, global.console, global.node, global.rel, global.graph, global.base, global.text, global.list, global.time, global.scheduler, global.ham, global.events);
	    global.union = mod.exports;
	  }
	})(this, function (module, exports, _reserved, _obj, _console, _node, _rel, _graph, _base, _text, _list, _time, _scheduler, _ham, _events) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _graph2 = _interopRequireDefault(_graph);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _time2 = _interopRequireDefault(_time);
	
	  var _scheduler2 = _interopRequireDefault(_scheduler);
	
	  var _ham2 = _interopRequireDefault(_ham);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  // import GunIs from '../is';
	  var Union = function Union(gun, prime, cb, opt) {
	    // merge two graphs into the first.
	    var opt = opt || _obj2.default.is(cb) ? cb : {};
	    var ctx = { graph: gun.__.graph, count: 0 };
	    ctx.cb = function () {
	      cb = _base2.default.fns.is(cb) ? cb() && null : null;
	    };
	    if (!ctx.graph) {
	      ctx.err = { err: (0, _console2.default)("No graph!") };
	    }
	    if (!prime) {
	      ctx.err = { err: (0, _console2.default)("No data to merge!") };
	    }
	    if (ctx.soul = _node2.default.soul(prime)) {
	      prime = _graph2.default.ify(prime);
	    }
	    if (!(0, _graph2.default)(prime, null, function (val, field, node) {
	      var meta;
	      if (!_base2.default.num.is(_node2.default.state(node, field))) {
	        return ctx.err = { err: (0, _console2.default)("No state on '" + field + "'!") };
	      }
	    }) || ctx.err) {
	      return ctx.err = ctx.err || { err: (0, _console2.default)("Invalid graph!", prime) }, ctx;
	    }
	    function emit(at) {
	      (0, _events2.default)('operating').emit(gun, at);
	    }
	
	    (function union(graph, prime) {
	      var prime = _obj2.default.map(prime, function (n, s, t) {
	        t(n);
	      }).sort(function (A, B) {
	        var s = _node2.default.soul(A);
	        if (graph[s]) {
	          return 1;
	        }
	        return 0;
	      });
	      ctx.count += 1;
	      ctx.err = _list2.default.map(prime, function (node, soul) {
	        soul = _node2.default.soul(node);
	        if (!soul) {
	          return { err: (0, _console2.default)("Soul missing or mismatching!") };
	        }
	        ctx.count += 1;
	        var vertex = graph[soul];
	        if (!vertex) {
	          graph[soul] = vertex = _node2.default.ify({}, soul);
	        }
	        Union.HAM(vertex, node, function (vertex, field, val, state) {
	          (0, _events2.default)('historical').emit(gun, { soul: soul, field: field, value: val, state: state, change: node });
	          gun.__.on('historical').emit({ soul: soul, field: field, change: node });
	        }, function (vertex, field, val, state) {
	          if (!vertex) {
	            return;
	          }
	          var change = _node2.default.soul.ify({}, soul);
	          if (field) {
	            _node2.default.state.ify([vertex, change, node], field, val);
	          }
	          emit({ soul: soul, field: field, value: val, state: state, change: change });
	        }, function (vertex, field, val, state) {
	          (0, _events2.default)('deferred').emit(gun, { soul: soul, field: field, value: val, state: state, change: node });
	        })(function () {
	          emit({ soul: soul, change: node });
	          if (opt.soul) {
	            opt.soul(soul);
	          }
	          if (!(ctx.count -= 1)) {
	            ctx.cb();
	          }
	        }); // TODO: BUG? Handle error!
	      });
	      ctx.count -= 1;
	    })(ctx.graph, prime);
	    if (!ctx.count) {
	      ctx.cb();
	    }
	    return ctx;
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	
	
	  Union.ify = function (gun, prime, cb, opt) {
	    if (gun) {
	      gun = gun.__ && gun.__.graph ? gun.__.graph : gun;
	    }
	    if (_text2.default.is(prime)) {
	      if (gun && gun[prime]) {
	        prime = gun[prime];
	      } else {
	        return _node2.default.ify({}, prime);
	      }
	    }
	    var vertex = _node2.default.soul.ify({}, _node2.default.soul(prime)),
	        prime = _graph2.default.ify(prime) || prime;
	    if ((0, _graph2.default)(prime, null, function (val, field) {
	      var node;
	
	      function merge(a, f, v) {
	        _node2.default.state.ify(a, f, v);
	      }
	
	      if ((0, _rel2.default)(val)) {
	        node = gun ? gun[field] || prime[field] : prime[field];
	      }
	      Union.HAM(vertex, node, function () {}, function (vert, f, v) {
	        merge([vertex, node], f, v);
	      }, function () {})(function (err) {
	        if (err) {
	          merge([vertex], field, val);
	        }
	      });
	    })) {
	      return vertex;
	    }
	  };
	
	  Union.HAM = function (vertex, delta, lower, now, upper) {
	    upper.max = -Infinity;
	    now.end = true;
	    delta = delta || {};
	    vertex = vertex || {};
	    _obj2.default.map(delta._, function (v, f) {
	      if (_reserved2.default.state === f || _reserved2.default.soul === f) {
	        return;
	      }
	      vertex._[f] = v;
	    });
	    if (!(0, _node2.default)(delta, function update(incoming, field) {
	      now.end = false;
	      var ctx = { incoming: {}, current: {} },
	          state;
	      ctx.drift = _time2.default.now(); // DANGEROUS!
	      ctx.incoming.value = (0, _rel2.default)(incoming) || incoming;
	      ctx.current.value = (0, _rel2.default)(vertex[field]) || vertex[field];
	      ctx.incoming.state = _base2.default.num.is(ctx.tmp = ((delta._ || {})[_reserved2.default.state] || {})[field]) ? ctx.tmp : -Infinity;
	      ctx.current.state = _base2.default.num.is(ctx.tmp = ((vertex._ || {})[_reserved2.default.state] || {})[field]) ? ctx.tmp : -Infinity;
	      upper.max = ctx.incoming.state > upper.max ? ctx.incoming.state : upper.max;
	      state = (0, _ham2.default)(ctx.drift, ctx.incoming.state, ctx.current.state, ctx.incoming.value, ctx.current.value);
	      if (state.err) {
	        root.console.log(".!HYPOTHETICAL AMNESIA MACHINE ERR!.", state.err); // this error should never happen.
	        return;
	      }
	      if (state.state || state.historical || state.current) {
	        lower.call(state, vertex, field, incoming, ctx.incoming.state);
	        return;
	      }
	      if (state.incoming) {
	        now.call(state, vertex, field, incoming, ctx.incoming.state);
	        return;
	      }
	      if (state.defer) {
	        upper.wait = true;
	        upper.call(state, vertex, field, incoming, ctx.incoming.state); // signals that there are still future modifications.
	        (0, _scheduler2.default)(ctx.incoming.state, function () {
	          update(incoming, field);
	          if (ctx.incoming.state === upper.max) {
	            (upper.last || function () {})();
	          }
	        });
	      }
	    })) {
	      return function (fn) {
	        if (fn) {
	          fn({ err: 'Not a node!' });
	        }
	      };
	    }
	    if (now.end) {
	      now.call({}, vertex);
	    } // TODO: Should HAM handle empty updates? YES.
	    return function (fn) {
	      upper.last = fn || function () {};
	      if (!upper.wait) {
	        upper.last();
	      }
	    };
	  };
	
	  exports.default = Union;
	  module.exports = exports['default'];
	});

/***/ },
/* 16 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.console = mod.exports;
	  }
	})(this, function (module, exports) {
	  "use strict";
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  var root = undefined || {};
	  //TODO: Check why is needed to fake console
	  root.console = root.console || {
	    log: function log(s) {
	      return s;
	    }
	  }; // safe for old browsers
	  var _GLog = {};
	  var console = {
	    log: function log(s) {
	      return root.console.log.apply(root.console, arguments), s;
	    },
	    Log: _GLog = function GLog(s) {
	      return !_GLog.squelch && root.console.log.apply(root.console, arguments), s;
	    }
	  };
	  console.debug = function (i, s) {
	    return _GLog.debug && i === _GLog.debug && _GLog.debug++ && root.console.log.apply(root.console, arguments), s;
	  };
	  _GLog.count = function (s) {
	    return _GLog.count[s] = _GLog.count[s] || 0, _GLog.count[s]++;
	  };
	
	  exports.default = _GLog;
	  module.exports = exports["default"];
	});

/***/ },
/* 17 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(6), __webpack_require__(3), __webpack_require__(18), __webpack_require__(10), __webpack_require__(20), __webpack_require__(21)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../reserved'), require('../utilities/obj'), require('../utilities/base'), require('../is/base'), require('../utilities/time'), require('./soul'), require('./state'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.reserved, global.obj, global.base, global.base, global.time, global.soul, global.state);
	    global.node = mod.exports;
	  }
	})(this, function (module, exports, _reserved, _obj, _base, _base3, _time, _soul, _state) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _base4 = _interopRequireDefault(_base3);
	
	  var _time2 = _interopRequireDefault(_time);
	
	  var _soul2 = _interopRequireDefault(_soul);
	
	  var _state2 = _interopRequireDefault(_state);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var GunIsVal = _base4.default.val; /**
	                                      * Created by Paul on 9/7/2016.
	                                      */
	
	
	  var Node = function Node(n, cb, t) {
	    var s; // checks to see if an object is a valid node.
	    if (!_obj2.default.is(n)) {
	      return false;
	    } // must be an object.
	    if (s = Node.soul(n)) {
	      // must have a soul on it.
	      return !_obj2.default.map(n, function (v, f) {
	        // we invert this because the way we check for this is via a negation.
	        if (f == _reserved2.default.meta) {
	          return;
	        } // skip over the metadata.
	        if (!GunIsVal(v)) {
	          return true;
	        } // it is true that this is an invalid node.
	        if (cb) {
	          cb.call(t, v, f, n);
	        } // optionally callback each field/value.
	      });
	    }
	    return false; // nope! This was not a valid node.
	  };
	
	  Node.ify = function (n, s, o) {
	    // convert a shallow object into a node.
	    o = _base2.default.bi.is(o) ? { force: o } : o || {}; // detect options.
	    n = Node.soul.ify(n, s, o.force); // put a soul on it.
	    _obj2.default.map(n, function (v, f) {
	      // iterate over each field/value.
	      if (_reserved2.default.meta === f) {
	        return;
	      } // ignore meta.
	      Node.state.ify([n], f, v, o.state = o.state || _time2.default.now()); // and set the state for this field and value on this node.
	    });
	    return n; // This will only be a valid node if the object wasn't already deep!
	  };
	
	  Node.soul = _soul2.default;
	
	  Node.state = _state2.default;
	
	  exports.default = Node;
	  module.exports = exports['default'];
	});

/***/ },
/* 18 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(3), __webpack_require__(6), __webpack_require__(5), __webpack_require__(1), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/base'), require('../utilities/obj'), require('../utilities/text'), require('../reserved'), require('./rel'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.base, global.obj, global.text, global.reserved, global.rel);
	    global.base = mod.exports;
	  }
	})(this, function (module, exports, _base, _obj, _text, _reserved, _rel) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  //TODO: sucks, I have to remove the Gun reference or to move it somehow.
	  var Is = function Is(gun) {
	    return !!gun && gun.constructor && gun.constructor.name === 'Gun';
	  }; // check to see if it is a GUN instance.
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	  Is.val = function (v) {
	    // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
	    if (v === null) {
	      return true;
	    } // "deletes", nulling out fields.
	    if (v === Infinity) {
	      return false;
	    } // we want this to be, but JSON does not support it, sad face.
	    if (_base2.default.bi.is(v) // by "binary" we mean boolean.
	    || _base2.default.num.is(v) || _text2.default.is(v)) {
	      // by "text" we mean strings.
	      return true; // simple values are valid.
	    }
	    return (0, _rel2.default)(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
	  };
	
	  Is.lex = function (l) {
	    var r = true;
	    if (!_obj2.default.is(l)) {
	      return false;
	    }
	    _obj2.default.map(l, function (v, f) {
	      if (!_obj2.default.has(_reserved2.default, f) || !(_text2.default.is(v) || _obj2.default.is(v))) {
	        return r = false;
	      }
	    }); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
	    return r;
	  };
	
	  exports.default = Is;
	  module.exports = exports['default'];
	});

/***/ },
/* 19 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(6), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../reserved'), require('../utilities/obj'), require('../utilities/text'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.reserved, global.obj, global.text);
	    global.rel = mod.exports;
	  }
	})(this, function (module, exports, _reserved, _obj, _text) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var Rel = function Rel(v) {
	    // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
	    if (_obj2.default.is(v)) {
	      // must be an object.
	      var id;
	      _obj2.default.map(v, function (s, f) {
	        // map over the object...
	        if (id) {
	          return id = false;
	        } // if ID is already defined AND we're still looping through the object, it is considered invalid.
	        if (f == _reserved2.default.soul && _text2.default.is(s)) {
	          // the field should be '#' and have a text value.
	          id = s; // we found the soul!
	        } else {
	          return id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
	        }
	      });
	      if (id) {
	        // a valid id was found.
	        return id; // yay! Return it.
	      }
	    }
	    return false; // the value was not a valid soul relation.
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	
	
	  Rel.ify = function (s) {
	    var r = {};
	    return _obj2.default.put(r, _reserved2.default.soul, s), r;
	  }; // convert a soul into a relation and return it.
	
	  exports.default = Rel;
	  module.exports = exports['default'];
	});

/***/ },
/* 20 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(5)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../reserved'), require('../utilities/text'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.reserved, global.text);
	    global.soul = mod.exports;
	  }
	})(this, function (module, exports, _reserved, _text) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	  var soul = function soul(n, s) {
	    return n && n._ && n._[s || _reserved2.default.soul] || false;
	  }; // convenience function to check to see if there is a soul on a node and return it.
	
	  soul.ify = function (n, s, o) {
	    // put a soul on an object.
	    n = n || {}; // make sure it exists.
	    n._ = n._ || {}; // make sure meta exists.
	    n._[_reserved2.default.soul] = o ? s : n._[_reserved2.default.soul] || s || _text2.default.random(); // if it already has a soul then use that instead - unless you force the soul you want with an option.
	    return n;
	  };
	
	  exports.default = soul;
	  module.exports = exports['default'];
	});

/***/ },
/* 21 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(1), __webpack_require__(9), __webpack_require__(3), __webpack_require__(18)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../reserved'), require('../utilities/list'), require('../utilities/base'), require('../is/base'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.reserved, global.list, global.base, global.base);
	    global.state = mod.exports;
	  }
	})(this, function (module, exports, _reserved, _list, _base, _base3) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _base4 = _interopRequireDefault(_base3);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	  var GunIsVal = _base4.default.val;
	
	  var state = function state(n, f) {
	    return f && n && n._ && n._[_reserved2.default.state] && _base2.default.num.is(n._[_reserved2.default.state][f]) ? n._[_reserved2.default.state][f] : false;
	  }; // convenience function to get the state on a field on a node and return it.
	
	  state.ify = function (l, f, v, state) {
	    // put a field's state and value on some nodes.
	    l = _list2.default.is(l) ? l : [l]; // handle a list of nodes or just one node.
	    var l = l.reverse(),
	        d = l[0]; // we might want to inherit the state from the last node in the list.
	    _list2.default.map(l, function (n, i) {
	      // iterate over each node.
	      n = n || {}; // make sure it exists.
	      if (GunIsVal(v)) {
	        n[f] = v;
	      } // if we have a value, then put it.
	      n._ = n._ || {}; // make sure meta exists.
	      n = n._[_reserved2.default.state] = n._[_reserved2.default.state] || {}; // make sure HAM state exists.
	      if (i = d._[_reserved2.default.state][f]) {
	        n[f] = i;
	      } // inherit the state!
	      if (_base2.default.num.is(state)) {
	        n[f] = state;
	      } // or manually set the state.
	    });
	  };
	
	  exports.default = state;
	  module.exports = exports['default'];
	});

/***/ },
/* 22 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.ham = mod.exports;
	  }
	})(this, function (module, exports) {
	  "use strict";
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  var HAM = function HAM(machineState, incomingState, currentState, incomingValue, currentValue) {
	    // TODO: Lester's comments on roll backs could be vulnerable to divergence, investigate!
	    if (machineState < incomingState) {
	      // the incoming value is outside the boundary of the machine's state, it must be reprocessed in another state.
	      return { defer: true };
	    }
	    if (incomingState < currentState) {
	      // the incoming value is within the boundary of the machine's state, but not within the range.
	      return { historical: true };
	    }
	    if (currentState < incomingState) {
	      // the incoming value is within both the boundary and the range of the machine's state.
	      return { converge: true, incoming: true };
	    }
	    if (incomingState === currentState) {
	      if (incomingValue === currentValue) {
	        // Note: while these are practically the same, the deltas could be technically different
	        return { state: true };
	      }
	      /*
	       The following is a naive implementation, but will always work.
	       Never change it unless you have specific needs that absolutely require it.
	       If changed, your data will diverge unless you guarantee every peer's algorithm has also been changed to be the same.
	       As a result, it is highly discouraged to modify despite the fact that it is naive,
	       because convergence (data integrity) is generally more important.
	       Any difference in this algorithm must be given a new and different name.
	       */
	      if (String(incomingValue) < String(currentValue)) {
	        // String only works on primitive values!
	        return { converge: true, current: true };
	      }
	      if (String(currentValue) < String(incomingValue)) {
	        // String only works on primitive values!
	        return { converge: true, incoming: true };
	      }
	    }
	    return { err: "you have not properly handled recursion through your data or filtered it as JSON" };
	  };
	
	  exports.default = HAM;
	  module.exports = exports["default"];
	});

/***/ },
/* 23 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(6), __webpack_require__(17)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/obj'), require('../is/node'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.obj, global.node);
	    global.graph = mod.exports;
	  }
	})(this, function (module, exports, _obj, _node) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	  var Graph = function Graph(g, cb, fn, t) {
	    // checks to see if an object is a valid graph.
	    var exist = false;
	    if (!_obj2.default.is(g)) {
	      return false;
	    } // must be an object.
	    return !_obj2.default.map(g, function (n, s) {
	      // we invert this because the way we check for this is via a negation.
	      if (!n || s !== _node2.default.soul(n) || !(0, _node2.default)(n, fn)) {
	        return true;
	      } // it is true that this is an invalid graph.
	      (cb || function () {}).call(t, n, s, function (fn) {
	        // optional callback for each node.
	        if (fn) {
	          (0, _node2.default)(n, fn, t);
	        } // where we then have an optional callback for each field/value.
	      });
	      exist = true;
	    }) && exist; // makes sure it wasn't an empty object.
	  };
	
	  Graph.ify = function (n) {
	    var s; // wrap a node into a graph.
	    if (s = _node2.default.soul(n)) {
	      // grab the soul from the node, if it is a node.
	      return _obj2.default.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
	    }
	  };
	
	  exports.default = Graph;
	  module.exports = exports['default'];
	});

/***/ },
/* 24 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(25), __webpack_require__(26), __webpack_require__(27), __webpack_require__(29), __webpack_require__(39), __webpack_require__(46), __webpack_require__(40), __webpack_require__(41), __webpack_require__(42), __webpack_require__(43), __webpack_require__(44), __webpack_require__(45)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./opt'), require('./chain'), require('./put'), require('./get'), require('./key'), require('./on'), require('./path'), require('./map'), require('./val'), require('./not'), require('./set'), require('./init'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.opt, global.chain, global.put, global.get, global.key, global.on, global.path, global.map, global.val, global.not, global.set, global.init);
	    global.index = mod.exports;
	  }
	})(this, function (module, exports, _opt, _chain, _put, _get, _key, _on, _path, _map, _val, _not, _set, _init) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _opt2 = _interopRequireDefault(_opt);
	
	  var _chain2 = _interopRequireDefault(_chain);
	
	  var _put2 = _interopRequireDefault(_put);
	
	  var _get2 = _interopRequireDefault(_get);
	
	  var _key2 = _interopRequireDefault(_key);
	
	  var _on2 = _interopRequireDefault(_on);
	
	  var _path2 = _interopRequireDefault(_path);
	
	  var _map2 = _interopRequireDefault(_map);
	
	  var _val2 = _interopRequireDefault(_val);
	
	  var _not2 = _interopRequireDefault(_not);
	
	  var _set2 = _interopRequireDefault(_set);
	
	  var _init2 = _interopRequireDefault(_init);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.default = { opt: _opt2.default, chain: _chain2.default, put: _put2.default, get: _get2.default, key: _key2.default, on: _on2.default, path: _path2.default, map: _map2.default, val: _val2.default, not: _not2.default, set: _set2.default, init: _init2.default };
	  module.exports = exports['default'];
	});

/***/ },
/* 25 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(5), __webpack_require__(9), __webpack_require__(6), __webpack_require__(3), __webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/text'), require('../utilities/list'), require('../utilities/obj'), require('../utilities/base'), require('../events'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.text, global.list, global.obj, global.base, global.events);
	    global.opt = mod.exports;
	  }
	})(this, function (module, exports, _text, _list, _obj, _base, _events) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (opt, stun) {
	    opt = opt || {};
	    var gun = this,
	        root = gun.__ && gun.__.gun ? gun.__.gun : (gun._ = gun.__ = { gun: gun }).gun.chain(); // if root does not exist, then create a root chain.
	    root.__.by = root.__.by || function (f) {
	      return gun.__.by[f] = gun.__.by[f] || {};
	    };
	    root.__.graph = root.__.graph || {};
	    root.__.opt = root.__.opt || { peers: {} };
	    root.__.opt.wire = root.__.opt.wire || {};
	    if (_text2.default.is(opt)) {
	      opt = { peers: opt };
	    }
	    if (_list2.default.is(opt)) {
	      opt = { peers: opt };
	    }
	    if (_text2.default.is(opt.peers)) {
	      opt.peers = [opt.peers];
	    }
	    if (_list2.default.is(opt.peers)) {
	      opt.peers = _obj2.default.map(opt.peers, function (n, f, m) {
	        m(n, {});
	      });
	    }
	    _obj2.default.map(opt.peers, function (v, f) {
	      root.__.opt.peers[f] = v;
	    });
	    _obj2.default.map(opt.wire, function (h, f) {
	      if (!_base2.default.fns.is(h)) {
	        return;
	      }
	      root.__.opt.wire[f] = h;
	    });
	    _obj2.default.map(['key', 'on', 'path', 'map', 'not', 'init'], function (f) {
	      if (!opt[f]) {
	        return;
	      }
	      root.__.opt[f] = opt[f] || root.__.opt[f];
	    });
	    if (!stun) {
	      (0, _events2.default)('opt').emit(root, opt);
	    }
	    return gun;
	  };
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	  ;
	  module.exports = exports['default'];
	});

/***/ },
/* 26 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(11)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../events'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.events);
	    global.chain = mod.exports;
	  }
	})(this, function (module, exports, _events) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (s) {
	    var from = this,
	        gun = !from.back ? from : new this.constructor(from); //Gun(from);
	    gun._ = gun._ || {};
	    gun._.back = gun.back || from;
	    gun.back = gun.back || from;
	    gun.__ = gun.__ || from.__;
	    gun._.on = gun._.on || _events2.default.create();
	    gun._.at = gun._.at || _events2.default.at(gun._.on);
	    return gun;
	  };
	
	  var _events2 = _interopRequireDefault(_events);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	  ;
	  module.exports = exports['default'];
	});

/***/ },
/* 27 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(10), __webpack_require__(6), __webpack_require__(5), __webpack_require__(28), __webpack_require__(17), __webpack_require__(19), __webpack_require__(18), __webpack_require__(16), __webpack_require__(11), __webpack_require__(1), __webpack_require__(15), __webpack_require__(3)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/time'), require('../utilities/obj'), require('../utilities/text'), require('../serializer'), require('../is/node'), require('../is/rel'), require('../is/base'), require('../console'), require('../events'), require('../reserved'), require('../specific/union'), require('../utilities/base'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.time, global.obj, global.text, global.serializer, global.node, global.rel, global.base, global.console, global.events, global.reserved, global.union, global.base);
	    global.put = mod.exports;
	  }
	})(this, function (module, exports, _time, _obj, _text, _serializer, _node, _rel, _base, _console, _events, _reserved, _union, _base3) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (val, cb, opt) {
	    opt = opt || {};
	    cb = cb || function () {};
	    cb.hash = {};
	    var gun = this,
	        chain = gun.chain(),
	        tmp = { val: val },
	        drift = _time2.default.now();
	
	    function put(at) {
	      var val = tmp.val;
	      var ctx = { obj: val }; // prep the value for serialization
	      ctx.soul = at.field ? at.soul : at.at && at.at.soul || at.soul; // figure out where we are
	      ctx.field = at.field ? at.field : at.at && at.at.field || at.field; // did we come from some where?
	      if ((0, _base2.default)(val)) {
	        if (!ctx.field) {
	          return cb.call(chain, { err: ctx.err = (0, _console2.default)('No field to link node to!') }), chain._.at('err').emit(ctx.err);
	        }
	        return val.val(function (node) {
	          var soul = _node2.default.soul(node);
	          if (!soul) {
	            return cb.call(chain, { err: ctx.err = (0, _console2.default)('Only a node can be linked! Not "' + node + '"!') }), chain._.at('err').emit(ctx.err);
	          }
	          tmp.val = _rel2.default.ify(soul);
	          put(at);
	        });
	      }
	      if (cb.hash[at.hash = at.hash || _events2.default.at.hash(at)]) {
	        return;
	      } // if we have already seen this hash...
	      cb.hash[at.hash] = true; // else mark that we're processing the data (failure to write could still occur).
	      ctx.by = chain.__.by(ctx.soul);
	      ctx.not = at.not || at.at && at.at.not;
	      _obj2.default.del(at, 'not');
	      _obj2.default.del(at.at || at, 'not'); // the data is no longer not known! // TODO: BUG! It could have been asynchronous by the time we now delete these properties. Don't other parts of the code assume their deletion is synchronous?
	      if (ctx.field) {
	        _obj2.default.as(ctx.obj = {}, ctx.field, val);
	      } // if there is a field, then data is actually getting put on the parent.
	      else if (!_obj2.default.is(val)) {
	          return cb.call(chain, ctx.err = { err: (0, _console2.default)("No node exists to put " + (typeof val === 'undefined' ? 'undefined' : _typeof(val)) + ' "' + val + '" in!') }), chain._.at('err').emit(ctx.err);
	        } // if the data is a primitive and there is no context for it yet, then we have an error.
	      // TODO: BUG? gun.get(key).path(field).put() isn't doing it as pseudo.
	      function soul(env, cb, map) {
	        var eat;
	        if (!env || !(eat = env.at) || !env.at.node) {
	          return;
	        }
	        if (!eat.node._) {
	          eat.node._ = {};
	        }
	        if (!eat.node._[_reserved2.default.state]) {
	          eat.node._[_reserved2.default.state] = {};
	        }
	        if (!_node2.default.soul(eat.node)) {
	          if (ctx.obj === eat.obj) {
	            _obj2.default.as(env.graph, eat.soul = _obj2.default.as(eat.node._, _reserved2.default.soul, _node2.default.soul(eat.obj) || ctx.soul), eat.node);
	            cb(eat, eat.soul);
	          } else {
	            var path = function path(err, node) {
	              if (path.opt && path.opt.on && path.opt.on.off) {
	                path.opt.on.off();
	              }
	              if (path.opt.done) {
	                return;
	              }
	              path.opt.done = true;
	              if (err) {
	                env.err = err;
	              }
	              eat.soul = _node2.default.soul(node) || _node2.default.soul(eat.obj) || _node2.default.soul(eat.node) || _text2.default.random();
	              _obj2.default.as(env.graph, _obj2.default.as(eat.node._, _reserved2.default.soul, eat.soul), eat.node);
	              cb(eat, eat.soul);
	            };
	            path.opt = { put: true };
	            ctx.not ? path() : (at.field || at.at ? gun._.back : gun).path(eat.path || [], path, path.opt);
	          }
	        }
	        if (!eat.field) {
	          return;
	        }
	        eat.node._[_reserved2.default.state][eat.field] = drift;
	      }
	
	      function end(err, ify) {
	        ctx.ify = ify;
	        (0, _events2.default)('put').emit(chain, at, ctx, opt, cb, val);
	        if (err || ify.err) {
	          return cb.call(chain, err || ify.err), chain._.at('err').emit(err || ify.err);
	        } // check for serialization error, emit if so.
	        if (err = (0, _union2.default)(chain, ify.graph, {
	          end: false, soul: function soul(_soul) {
	            if (chain.__.by(_soul).end) {
	              return;
	            }
	            (0, _union2.default)(chain, _node2.default.soul.ify({}, _soul)); // fire off an end node if there hasn't already been one, to comply with the wire spec.
	          }
	        }).err) {
	          return cb.call(chain, err), chain._.at('err').emit(err);
	        } // now actually union the serialized data, emit error if any occur.
	        if (_base4.default.fns.is(end.wire = chain.__.opt.wire.put)) {
	          var wcb = function wcb(err, ok, info) {
	            if (err) {
	              return (0, _console2.default)(err.err || err), cb.call(chain, err), chain._.at('err').emit(err);
	            }
	            return cb.call(chain, err, ok);
	          };
	          end.wire(ify.graph, wcb, opt);
	        } else {
	          if (!_console2.default.count('no-wire-put')) {
	            (0, _console2.default)("Warning! You have no persistence layer to save to!");
	          }
	          cb.call(chain, null); // This is in memory success, hardly "success" at all.
	        }
	        if (ctx.field) {
	          return gun._.back.path(ctx.field, null, { chain: opt.chain || chain });
	        }
	        if (ctx.not) {
	          return gun.__.gun.get(ctx.soul, null, { chain: opt.chain || chain });
	        }
	        chain.get(ctx.soul, null, { chain: opt.chain || chain, at: gun._.at });
	      }
	
	      (0, _serializer2.default)(ctx.obj, soul, { pure: true })(end); // serialize the data!
	    }
	
	    if (gun === gun.back) {
	      // if we are the root chain...
	      put({ soul: _node2.default.soul(val) || _text2.default.random(), not: true }); // then cause the new chain to save data!
	    } else {
	      (function () {
	        // put data on every soul that flows through this chain.
	        var back = function back(gun) {
	          if (back.get || gun._.back === gun || gun._.not) {
	            return;
	          } // TODO: CLEAN UP! Would be ideal to accomplish this in a more ideal way.
	          if (gun._.get) {
	            back.get = true;
	          }
	          gun._.at('null').event(function (at) {
	            this.off();
	            if (opt.init || gun.__.opt.init) {
	              return (0, _console2.default)("Warning! You have no context to `.put`", val, "!");
	            }
	            gun.init();
	          }, -999);
	          return back(gun._.back);
	        };
	
	        // else if we are on an existing chain then...
	        gun._.at('soul').map(put);;
	        if (!opt.init && !gun.__.opt.init) {
	          back(gun);
	        }
	      })();
	    }
	    chain.back = gun.back;
	    return chain;
	  };
	
	  var _time2 = _interopRequireDefault(_time);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _serializer2 = _interopRequireDefault(_serializer);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _union2 = _interopRequireDefault(_union);
	
	  var _base4 = _interopRequireDefault(_base3);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	    return typeof obj;
	  } : function (obj) {
	    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
	  };
	
	  ;
	  module.exports = exports['default'];
	});

/***/ },
/* 28 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(17), __webpack_require__(18), __webpack_require__(9), __webpack_require__(6), __webpack_require__(16), __webpack_require__(5), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./is/node'), require('./is/base'), require('./utilities/list'), require('./utilities/obj'), require('./console'), require('./utilities/text'), require('./reserved'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.node, global.base, global.list, global.obj, global.console, global.text, global.reserved);
	    global.serializer = mod.exports;
	  }
	})(this, function (module, exports, _node, _base, _list, _obj, _console, _text, _reserved) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var GunIsVal = _base2.default.val; /**
	                                      * Created by Paul on 9/7/2016.
	                                      */
	
	
	  var map = function map(ctx, cb) {
	    var u,
	        rel = function rel(at, soul) {
	      at.soul = at.soul || soul || _node2.default.soul(at.obj) || _node2.default.soul(at.node);
	      if (!ctx.opt.pure) {
	        ctx.graph[at.soul] = _node2.default.soul.ify(at.node, at.soul);
	        if (ctx.at.field) {
	          _node2.default.state.ify([at.node], at.field, u, ctx.opt.state);
	        }
	      }
	      _list2.default.map(at.back, function (rel) {
	        rel[_reserved2.default.soul] = at.soul;
	      });
	      unique(ctx);
	    },
	        it;
	    _obj2.default.map(ctx.at.obj, function (val, field) {
	      ctx.at.val = val;
	      ctx.at.field = field;
	      it = cb(ctx, rel, map) || true;
	      if (field === _reserved2.default.meta) {
	        ctx.at.node[field] = _obj2.default.copy(val); // TODO: BUG! Is this correct?
	        return;
	      }
	      if (String(field).indexOf('.') != -1 || false && notValidField(field)) {
	        // TODO: BUG! Do later for ACID "consistency" guarantee.
	        return ctx.err = { err: (0, _console2.default)("Invalid field name on '" + ctx.at.path.join('.') + "'!") };
	      }
	      if (!GunIsVal(val)) {
	        var at = { obj: val, node: {}, back: [], path: [field] },
	            tmp = {},
	            was;
	        at.path = (ctx.at.path || []).concat(at.path || []);
	        if (!_obj2.default.is(val)) {
	          return ctx.err = { err: (0, _console2.default)("Invalid value at '" + at.path.join('.') + "'!") };
	        }
	        if (was = seen(ctx, at)) {
	          tmp[_reserved2.default.soul] = _node2.default.soul(was.node) || null;
	          (was.back = was.back || []).push(ctx.at.node[field] = tmp);
	        } else {
	          ctx.queue.push(at);
	          tmp[_reserved2.default.soul] = null;
	          at.back.push(ctx.at.node[field] = tmp);
	        }
	      } else {
	        ctx.at.node[field] = _obj2.default.copy(val);
	      }
	    });
	    if (!it) {
	      cb(ctx, rel);
	    }
	  };
	  var unique = function unique(ctx) {
	    if (ctx.err || !_list2.default.map(ctx.seen, function (at) {
	      if (!at.soul) {
	        return true;
	      }
	    }) && !ctx.loop) {
	      return ctx.end(ctx.err, ctx), ctx.end = function () {};
	    }
	  };
	  var seen = function seen(ctx, at) {
	    return _list2.default.map(ctx.seen, function (has) {
	      if (at.obj === has.obj) {
	        return has;
	      }
	    }) || ctx.seen.push(at) && false;
	  };
	
	  var ify = function ify(data, cb, opt) {
	    opt = opt || {};
	    cb = cb || function (env, cb) {
	      cb(env.at, _node2.default.soul(env.at.obj) || _node2.default.soul(env.at.node) || _text2.default.random());
	    };
	    var end = function end(fn) {
	      ctx.end = fn || function () {};
	      unique(ctx);
	    },
	        ctx = { at: { path: [], obj: data }, root: {}, graph: {}, queue: [], seen: [], opt: opt, loop: true };
	    if (!data) {
	      return ctx.err = { err: (0, _console2.default)('Serializer does not have correct parameters.') }, end;
	    }
	    if (ctx.opt.start) {
	      _node2.default.soul.ify(ctx.root, ctx.opt.start);
	    }
	    ctx.at.node = ctx.root;
	    while (ctx.loop && !ctx.err) {
	      seen(ctx, ctx.at);
	      map(ctx, cb);
	      if (ctx.queue.length) {
	        ctx.at = ctx.queue.shift();
	      } else {
	        ctx.loop = false;
	      }
	    }
	    return end;
	  };
	
	  ify.wire = function (n, cb, opt) {
	    return _text2.default.is(n) ? ify.wire.from(n, cb, opt) : ify.wire.to(n, cb, opt);
	  };
	
	  ify.wire.to = function (n, cb, opt) {
	    var t, b;
	    if (!n || !(t = _node2.default.soul(n))) {
	      return null;
	    }
	    cb = cb || function () {};
	    t = b = "#'" + JSON.stringify(t) + "'";
	    _obj2.default.map(n, function (v, f) {
	      if (_reserved2.default.meta === f) {
	        return;
	      }
	      var w = '',
	          s = _node2.default.state(n, f);
	      if (!s) {
	        return;
	      }
	      w += ".'" + JSON.stringify(f) + "'";
	      w += "='" + JSON.stringify(v) + "'";
	      w += ">'" + JSON.stringify(s) + "'";
	      t += w;
	      w = b + w;
	      cb(null, w);
	    });
	    return t;
	  };
	
	  ify.wire.from = function (n, cb, opt) {
	    if (!n) {
	      return null;
	    }
	    var a = [],
	        s = -1,
	        e = 0,
	        end = 1;
	    while ((e = n.indexOf("'", s + 1)) >= 0) {
	      if (s === e || '\\' === n.charAt(e - 1)) {} else {
	        a.push(n.slice(s + 1, e));
	        s = e;
	      }
	    }
	    return a;
	  };
	
	  exports.default = ify;
	  module.exports = exports['default'];
	});

/***/ },
/* 29 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(15), __webpack_require__(3), __webpack_require__(5), __webpack_require__(6), __webpack_require__(1), __webpack_require__(11), __webpack_require__(17), __webpack_require__(16), __webpack_require__(30), __webpack_require__(19)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../specific/union'), require('../utilities/base'), require('../utilities/text'), require('../utilities/obj'), require('../reserved'), require('../events'), require('../is/node'), require('../console'), require('../bindings'), require('../is/rel'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.union, global.base, global.text, global.obj, global.reserved, global.events, global.node, global.console, global.bindings, global.rel);
	    global.get = mod.exports;
	  }
	})(this, function (module, exports, _union, _base, _text, _obj, _reserved, _events, _node, _console, _bindings, _rel) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _union2 = _interopRequireDefault(_union);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.default = function () {
	    (0, _bindings.getBindings)();
	    return function (lex, cb, opt) {
	      // get opens up a reference to a node and loads it.
	      var gun = this,
	          ctx = {
	        opt: opt || {},
	        cb: cb || function () {},
	        lex: _text2.default.is(lex) || _base2.default.num.is(lex) ? _rel2.default.ify(lex) : lex
	      };
	      ctx.force = ctx.opt.force;
	      if (cb !== ctx.cb) {
	        ctx.cb.no = true;
	      }
	      if (!_obj2.default.is(ctx.lex)) {
	        return ctx.cb.call(gun = gun.chain(), { err: (0, _console2.default)('Invalid get request!', lex) }), gun;
	      }
	      if (!(ctx.soul = ctx.lex[_reserved2.default.soul])) {
	        return ctx.cb.call(gun = this.chain(), { err: (0, _console2.default)('No soul to get!') }), gun;
	      } // TODO: With `.all` it'll be okay to not have an exact match!
	      ctx.by = gun.__.by(ctx.soul);
	      ctx.by.chain = ctx.by.chain || gun.chain();
	      function load(lex) {
	        var soul = lex[_reserved2.default.soul];
	        var cached = gun.__.by(soul).node || gun.__.graph[soul];
	        if (ctx.force) {
	          ctx.force = false;
	        } else if (cached) {
	          return false;
	        }
	        wire(lex, stream, ctx.opt);
	        return true;
	      }
	
	      function stream(err, data, info) {
	        //console.log("wire.get <--", err, data);
	        (0, _events2.default)('wire.get').emit(ctx.by.chain, ctx, err, data, info);
	        if (err) {
	          (0, _console2.default)(err.err || err);
	          ctx.cb.call(ctx.by.chain, err);
	          return ctx.by.chain._.at('err').emit({ soul: ctx.soul, err: err.err || err }).chain(ctx.opt.chain);
	        }
	        if (!data) {
	          ctx.cb.call(ctx.by.chain, null);
	          return ctx.by.chain._.at('null').emit({ soul: ctx.soul, not: true }).chain(ctx.opt.chain);
	        }
	        if (_obj2.default.empty(data)) {
	          return;
	        }
	        if (err = (0, _union2.default)(ctx.by.chain, data).err) {
	          ctx.cb.call(ctx.by.chain, err);
	          return ctx.by.chain._.at('err').emit({
	            soul: _node2.default.soul(data) || ctx.soul,
	            err: err.err || err
	          }).chain(ctx.opt.chain);
	        }
	      }
	
	      function wire(lex, cb, opt) {
	        (0, _events2.default)('get.wire').emit(ctx.by.chain, ctx, lex, cb, opt);
	        if (_base2.default.fns.is(gun.__.opt.wire.get)) {
	          return gun.__.opt.wire.get(lex, cb, opt);
	        }
	        if (!_console2.default.count('no-wire-get')) {
	          (0, _console2.default)("Warning! You have no persistence layer to get from!");
	        }
	        cb(null); // This is in memory success, hardly "success" at all.
	      }
	
	      function on(at) {
	        if (on.ran = true) {
	          ctx.opt.on = this;
	        }
	        if (load(ctx.lex)) {
	          return;
	        }
	        (0, _events2.default)('get').emit(ctx.by.chain, at, ctx, ctx.opt, ctx.cb, ctx.lex);
	      }
	
	      ctx.opt.on = (ctx.opt.at || gun.__.at)(ctx.soul).event(on);
	      ctx.by.chain._.get = ctx.lex;
	      if (!ctx.opt.ran && !on.ran) {
	        on.call(ctx.opt.on, { soul: ctx.soul });
	      }
	      return ctx.by.chain;
	    };
	  }();
	
	  module.exports = exports['default'];
	});

/***/ },
/* 30 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [exports, __webpack_require__(31), __webpack_require__(35), __webpack_require__(36), __webpack_require__(37), __webpack_require__(38)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(exports, require('./opt'), require('./get'), require('./key'), require('./path'), require('./val'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod.exports, global.opt, global.get, global.key, global.path, global.val);
	    global.index = mod.exports;
	  }
	})(this, function (exports, _opt, _get, _key, _path, _val) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  exports.valBindings = exports.pathBindings = exports.keyBindings = exports.getBindings = exports.optBindings = undefined;
	
	  var _opt2 = _interopRequireDefault(_opt);
	
	  var _get2 = _interopRequireDefault(_get);
	
	  var _key2 = _interopRequireDefault(_key);
	
	  var _path2 = _interopRequireDefault(_path);
	
	  var _val2 = _interopRequireDefault(_val);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.optBindings = _opt2.default;
	  exports.getBindings = _get2.default;
	  exports.keyBindings = _key2.default;
	  exports.pathBindings = _path2.default;
	  exports.valBindings = _val2.default;
	});

/***/ },
/* 31 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(32), __webpack_require__(11), __webpack_require__(5), __webpack_require__(10), __webpack_require__(6), __webpack_require__(15), __webpack_require__(33), __webpack_require__(18), __webpack_require__(17), __webpack_require__(23), __webpack_require__(16), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./store'), require('../events'), require('../utilities/text'), require('../utilities/time'), require('../utilities/obj'), require('../specific/union'), require('../request'), require('../is/base'), require('../is/node'), require('../is/graph'), require('../console'), require('../reserved'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.store, global.events, global.text, global.time, global.obj, global.union, global.request, global.base, global.node, global.graph, global.console, global.reserved);
	    global.opt = mod.exports;
	  }
	})(this, function (module, exports, _store, _events, _text, _time, _obj, _union, _request, _base, _node, _graph, _console, _reserved) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _store2 = _interopRequireDefault(_store);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _time2 = _interopRequireDefault(_time);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _union2 = _interopRequireDefault(_union);
	
	  var _request2 = _interopRequireDefault(_request);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _graph2 = _interopRequireDefault(_graph);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  var GunIsLex = _base2.default.lex;
	
	  var Bindings = (0, _events2.default)('opt').event(function (gun, opt) {
	    opt = opt || {};
	    var tab = gun.tab = gun.tab || {};
	    tab.store = tab.store || _store2.default;
	    tab.request = tab.request || _request2.default;
	    if (!tab.request) {
	      throw new Error("Default GUN driver could not find default network abstraction.");
	    }
	    tab.request.s = tab.request.s || {};
	    tab.headers = opt.headers || {};
	    tab.headers['gun-sid'] = tab.headers['gun-sid'] || _text2.default.random(); // stream id
	    tab.prefix = tab.prefix || opt.prefix || 'gun/';
	    tab.get = tab.get || function (lex, cb, opt) {
	      if (!lex) {
	        return;
	      }
	      var soul = lex[_reserved2.default.soul];
	      if (!soul) {
	        return;
	      }
	      cb = cb || function () {};
	      var ropt = {};
	      (ropt.headers = _obj2.default.copy(tab.headers)).id = tab.msg();
	      (function local(soul, cb) {
	        tab.store.get(tab.prefix + soul, function (err, data) {
	          if (!data) {
	            return;
	          } // let the peers handle no data.
	          if (err) {
	            return cb(err);
	          }
	          cb(err, cb.node = data); // node
	          cb(err, _node2.default.soul.ify({}, _node2.default.soul(data))); // end
	          cb(err, {}); // terminate
	        });
	      })(soul, cb);
	      if (!(cb.local = opt.local)) {
	        tab.request.s[ropt.headers.id] = tab.error(cb, "Error: Get failed!", function (reply) {
	          setTimeout(function () {
	            tab.put(_graph2.default.ify(reply.body), function () {}, { local: true, peers: {} });
	          }, 1); // and flush the in memory nodes of this graph to localStorage after we've had a chance to union on it.
	        });
	        _obj2.default.map(opt.peers || gun.__.opt.peers, function (peer, url) {
	          var p = {};
	          tab.request(url, lex, tab.request.s[ropt.headers.id], ropt);
	          cb.peers = true;
	        });
	        var node = gun.__.graph[soul];
	        if (node) {
	          tab.put(_graph2.default.ify(node));
	        }
	      }
	      tab.peers(cb);
	    };
	    tab.put = tab.put || function (graph, cb, opt) {
	      cb = cb || function () {};
	      opt = opt || {};
	      var ropt = {};
	      (ropt.headers = _obj2.default.copy(tab.headers)).id = tab.msg();
	      (0, _graph2.default)(graph, function (node, soul) {
	        if (!gun.__.graph[soul]) {
	          return;
	        }
	        tab.store.put(tab.prefix + soul, gun.__.graph[soul], function (err) {
	          if (err) {
	            cb({ err: err });
	          }
	        });
	      });
	      if (!(cb.local = opt.local)) {
	        tab.request.s[ropt.headers.id] = tab.error(cb, "Error: Put failed!");
	        _obj2.default.map(opt.peers || gun.__.opt.peers, function (peer, url) {
	          tab.request(url, graph, tab.request.s[ropt.headers.id], ropt);
	          cb.peers = true;
	        });
	      }
	      tab.peers(cb);
	    };
	    tab.error = function (cb, error, fn) {
	      return function (err, reply) {
	        reply.body = reply.body || reply.chunk || reply.end || reply.write;
	        if (err || !reply || (err = reply.body && reply.body.err)) {
	          return cb({ err: (0, _console2.default)(err || error) });
	        }
	        if (fn) {
	          fn(reply);
	        }
	        cb(null, reply.body);
	      };
	    };
	    tab.peers = function (cb, o) {
	      if (_text2.default.is(cb)) {
	        return (o = {})[cb] = {}, o;
	      }
	      if (cb && !cb.peers) {
	        setTimeout(function () {
	          if (!cb.local) {
	            if (!_console2.default.count('no-peers')) {
	              (0, _console2.default)("Warning! You have no peers to connect to!");
	            }
	          }
	          if (!(cb.graph || cb.node)) {
	            cb(null);
	          }
	        }, 1);
	      }
	    };
	    tab.msg = tab.msg || function (id) {
	      if (!id) {
	        return tab.msg.debounce[id = _text2.default.random(9)] = _time2.default.is(), id;
	      }
	      clearTimeout(tab.msg.clear);
	      tab.msg.clear = setTimeout(function () {
	        var now = _time2.default.is();
	        _obj2.default.map(tab.msg.debounce, function (t, id) {
	          if (now - t < 1000 * 60 * 5) {
	            return;
	          }
	          _obj2.default.del(tab.msg.debounce, id);
	        });
	      }, 500);
	      if (id = tab.msg.debounce[id]) {
	        return tab.msg.debounce[id] = _time2.default.is(), id;
	      }
	    };
	    tab.msg.debounce = tab.msg.debounce || {};
	    tab.server = tab.server || function (req, res) {
	      if (!req || !res || !req.body || !req.headers || !req.headers.id) {
	        return;
	      }
	      if (tab.request.s[req.headers.rid]) {
	        return tab.request.s[req.headers.rid](null, req);
	      }
	      if (tab.msg(req.headers.id)) {
	        return;
	      }
	      // TODO: Re-emit message to other peers if we have any non-overlaping ones.
	      if (req.headers.rid) {
	        return;
	      } // no need to process
	      if (GunIsLex(req.body)) {
	        return tab.server.get(req, res);
	      } else {
	        return tab.server.put(req, res);
	      }
	    };
	    tab.server.json = 'application/json';
	    tab.server.regex = gun.__.opt.route = gun.__.opt.route || opt.route || /^\/gun/i;
	    tab.server.get = function (req, cb) {
	      var soul = req.body[_reserved2.default.soul],
	          node;
	      if (!(node = gun.__.graph[soul])) {
	        return;
	      }
	      var reply = { headers: { 'Content-Type': tab.server.json, rid: req.headers.id, id: tab.msg() } };
	      cb({ headers: reply.headers, body: node });
	    };
	    tab.server.put = function (req, cb) {
	      var reply = { headers: { 'Content-Type': tab.server.json, rid: req.headers.id, id: tab.msg() } },
	          keep;
	      if (!req.body) {
	        return cb({ headers: reply.headers, body: { err: "No body" } });
	      }
	      if (!_obj2.default.is(req.body, function (node, soul) {
	        if (gun.__.graph[soul]) {
	          return true;
	        }
	      })) {
	        return;
	      }
	      if (req.err = (0, _union2.default)(gun, req.body, function (err, ctx) {
	        if (err) {
	          return cb({ headers: reply.headers, body: { err: err || "Union failed." } });
	        }
	        var ctx = ctx || {};
	        ctx.graph = {};
	        (0, _graph2.default)(req.body, function (node, soul) {
	          ctx.graph[soul] = gun.__.graph[soul];
	        });
	        gun.__.opt.wire.put(ctx.graph, function (err, ok) {
	          if (err) {
	            return cb({ headers: reply.headers, body: { err: err || "Failed." } });
	          }
	          cb({ headers: reply.headers, body: { ok: ok || "Persisted." } });
	        }, { local: true, peers: {} });
	      }).err) {
	        cb({ headers: reply.headers, body: { err: req.err || "Union failed." } });
	      }
	    };
	    _obj2.default.map(gun.__.opt.peers, function () {
	      // only create server if peers and do it once by returning immediately.
	      return tab.server.able = tab.server.able || tab.request.createServer(tab.server) || true;
	    });
	    gun.__.opt.wire.get = gun.__.opt.wire.get || tab.get;
	    gun.__.opt.wire.put = gun.__.opt.wire.put || tab.put;
	    gun.__.opt.wire.key = gun.__.opt.wire.key || tab.key;
	  });
	
	  exports.default = Bindings;
	  module.exports = exports['default'];
	});

/***/ },
/* 32 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(5), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/text'), require('../utilities/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.text, global.obj);
	    global.store = mod.exports;
	  }
	})(this, function (module, exports, _text, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  var s = {};
	
	  s.put = function (key, val, cb) {
	    try {
	      store.setItem(key, _text2.default.ify(val));
	    } catch (e) {
	      if (cb) cb(e);
	    }
	  };
	  s.get = function (key, cb) {
	    /*setTimeout(function(){*/
	    try {
	      cb(null, _obj2.default.ify(store.getItem(key) || null));
	    } catch (e) {
	      cb(e);
	    }
	    /*},1)*/
	  };
	  s.del = function (key) {
	    return store.removeItem(key);
	  };
	
	  var store = typeof localStorage === 'undefined' ? {
	    setItem: function setItem() {}, removeItem: function removeItem() {}, getItem: function getItem() {}
	  } : localStorage;
	
	  exports.default = s;
	  module.exports = exports['default'];
	});

/***/ },
/* 33 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(34)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./createServer'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.createServer);
	    global.index = mod.exports;
	  }
	})(this, function (module, exports, _createServer) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _createServer2 = _interopRequireDefault(_createServer);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  // import createRequest from  './createRequest';
	
	  function r(base, body, cb, opt) {
	    opt = opt || {};
	    var o = base.length ? { base: base } : {};
	    o.base = opt.base || base;
	    o.body = opt.body || body;
	    o.headers = opt.headers;
	    o.url = opt.url;
	    cb = cb || function () {};
	    if (!o.base) {
	      return;
	    }
	
	    //Gun.log("TRANSPORT:", opt);
	    if (ws(opt, r, cb)) {
	      return;
	    }
	    jsonp(opt, cb);
	  } /**
	     * Created by Paul on 9/7/2016.
	     */
	
	  r.createServer = _createServer2.default;
	
	  exports.default = r;
	  module.exports = exports['default'];
	});

/***/ },
/* 34 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports);
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports);
	    global.createServer = mod.exports;
	  }
	})(this, function (module, exports) {
	  "use strict";
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	  /**
	   * Created by Paul on 9/13/2016.
	   */
	
	  var createServer = function createServer(fn) {
	    createServer.s.push(fn);
	  };
	  createServer.ing = function (req, cb) {
	    var i = createServer.s.length;
	    while (i--) {
	      (createServer.s[i] || function () {})(req, cb);
	    }
	  };
	  createServer.s = [];
	
	  exports.default = createServer;
	  module.exports = exports["default"];
	});

/***/ },
/* 35 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(11), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../events'), require('../utilities/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.events, global.obj);
	    global.get = mod.exports;
	  }
	})(this, function (module, exports, _events, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	  var Bindings = function Bindings() {
	    (0, _events2.default)('operating').event(function (gun, at) {
	      if (!gun.__.by(at.soul).node) {
	        gun.__.by(at.soul).node = gun.__.graph[at.soul];
	      }
	      if (at.field) {
	        return;
	      } // TODO: It would be ideal to reuse HAM's field emit.
	      gun.__.on(at.soul).emit(at);
	    });
	    (0, _events2.default)('get').event(function (gun, at, ctx, opt, cb) {
	      if (ctx.halt) {
	        return;
	      } // TODO: CLEAN UP with event emitter option?
	      at.change = at.change || gun.__.by(at.soul).node;
	      if (opt.raw) {
	        return cb.call(opt.on, at);
	      }
	      if (!ctx.cb.no) {
	        cb.call(ctx.by.chain, null, _obj2.default.copy(ctx.node || gun.__.by(at.soul).node));
	      }
	      gun._.at('soul').emit(at).chain(opt.chain);
	    }, 0);
	    (0, _events2.default)('get').event(function (gun, at, ctx) {
	      if (ctx.halt) {
	        ctx.halt = false;
	        return;
	      } // TODO: CLEAN UP with event emitter option?
	    }, Infinity);
	  };
	
	  exports.default = Bindings;
	  module.exports = exports['default'];
	});

/***/ },
/* 36 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(11), __webpack_require__(23), __webpack_require__(17), __webpack_require__(15), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../events'), require('../is/graph'), require('../is/node'), require('../specific/union'), require('../utilities/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.events, global.graph, global.node, global.union, global.obj);
	    global.key = mod.exports;
	  }
	})(this, function (module, exports, _events, _graph, _node, _union, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _graph2 = _interopRequireDefault(_graph);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _union2 = _interopRequireDefault(_union);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var Bindings = function Bindings() {
	    (0, _events2.default)('put').event(function (gun, at, ctx, opt, cb) {
	      if (opt.key) {
	        return;
	      }
	      (0, _graph2.default)(ctx.ify.graph, function (node, soul) {
	        var key = { node: gun.__.graph[soul] };
	        if (!_node2.default.soul(key.node, 'key')) {
	          return;
	        }
	        if (!gun.__.by(soul).end) {
	          gun.__.by(soul).end = 1;
	        }
	        (0, _node2.default)(key.node, function each(rel, s) {
	          var n = gun.__.graph[s];
	          if (n && _node2.default.soul(n, 'key')) {
	            (0, _node2.default)(n, each);
	            return;
	          }
	          rel = ctx.ify.graph[s] = ctx.ify.graph[s] || _node2.default.soul.ify({}, s);
	          (0, _node2.default)(node, function (v, f) {
	            _node2.default.state.ify([rel, node], f, v);
	          });
	          _obj2.default.del(ctx.ify.graph, soul);
	        });
	      });
	    });
	    (0, _events2.default)('get').event(function (gun, at, ctx, opt, cb) {
	      if (ctx.halt) {
	        return;
	      } // TODO: CLEAN UP with event emitter option?
	      if (opt.key && opt.key.soul) {
	        at.soul = opt.key.soul;
	        gun.__.by(opt.key.soul).node = _union2.default.ify(gun, opt.key.soul); // TODO: Check performance?
	        gun.__.by(opt.key.soul).node._['key'] = 'pseudo';
	        at.change = _node2.default.soul.ify(_obj2.default.copy(at.change || gun.__.by(at.soul).node), at.soul, true); // TODO: Check performance?
	        return;
	      }
	      if (!(_node2.default.soul(gun.__.graph[at.soul], 'key') === 1)) {
	        return;
	      }
	      var node = at.change || gun.__.graph[at.soul];
	
	      function map(rel, soul) {
	        gun.__.gun.get(rel, cb, { key: ctx, chain: opt.chain || gun, force: opt.force });
	      }
	
	      ctx.halt = true;
	      (0, _node2.default)(node, map);
	    }, -999);
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	  exports.default = Bindings;
	  module.exports = exports['default'];
	});

/***/ },
/* 37 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(11), __webpack_require__(17), __webpack_require__(19), __webpack_require__(6), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../events'), require('../is/node'), require('../is/rel'), require('../utilities/obj'), require('../reserved'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.events, global.node, global.rel, global.obj, global.reserved);
	    global.path = mod.exports;
	  }
	})(this, function (module, exports, _events, _node, _rel, _obj, _reserved) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var Bindings = function Bindings() {
	    (0, _events2.default)('get').event(function (gun, at, ctx, opt, cb, lex) {
	      if (ctx.halt) {
	        return;
	      } // TODO: CLEAN UP with event emitter option?
	      if (opt.path) {
	        at.at = opt.path;
	      }
	      var xtc = { soul: lex[_reserved2.default.soul], field: lex[_reserved2.default.field] };
	      xtc.change = at.change || gun.__.by(at.soul).node;
	      if (xtc.field) {
	        // TODO: future feature!
	        if (!_obj2.default.has(xtc.change, xtc.field)) {
	          return;
	        }
	        ctx.node = _node2.default.soul.ify({}, at.soul); // TODO: CLEAN UP! ctx.node usage.
	        _node2.default.state.ify([ctx.node, xtc.change], xtc.field, xtc.change[xtc.field]);
	        at.change = ctx.node;
	        at.field = xtc.field;
	      }
	    }, -99);
	    (0, _events2.default)('get').event(function (gun, at, ctx, opt, cb, lex) {
	      if (ctx.halt) {
	        return;
	      } // TODO: CLEAN UP with event emitter option?
	      var xtc = {};
	      xtc.change = at.change || gun.__.by(at.soul).node;
	      if (!opt.put) {
	        // TODO: CLEAN UP be nice if path didn't have to worry about this.
	        (0, _node2.default)(xtc.change, function (v, f) {
	          var fat = _events2.default.at.copy(at);
	          fat.field = f;
	          fat.value = v;
	          _obj2.default.del(fat, 'at'); // TODO: CLEAN THIS UP! It would be nice in every other function every where else it didn't matter whether there was a cascading at.at.at.at or not, just and only whether the current context as a field or should rely on a previous field. But maybe that is the gotcha right there?
	          fat.change = fat.change || xtc.change;
	          if (v = (0, _rel2.default)(fat.value)) {
	            fat = { soul: v, at: fat };
	          }
	          gun._.at('path:' + f).emit(fat).chain(opt.chain);
	        });
	      }
	      if (!ctx.end) {
	        ctx.end = gun._.at('end').emit(at).chain(opt.chain);
	      }
	    }, 99);
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	
	  exports.default = Bindings;
	  module.exports = exports['default'];
	});

/***/ },
/* 38 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(11), __webpack_require__(6), __webpack_require__(1)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../events'), require('../utilities/obj'), require('../reserved'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.events, global.obj, global.reserved);
	    global.val = mod.exports;
	  }
	})(this, function (module, exports, _events, _obj, _reserved) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  var Bindings = function Bindings() {
	    (0, _events2.default)('get.wire').event(function (gun, ctx) {
	      if (!ctx.soul) {
	        return;
	      }
	      var end;
	      (end = gun.__.by(ctx.soul)).end = end.end || -1; // TODO: CLEAN UP! This should be per peer!
	    }, -999);
	    (0, _events2.default)('wire.get').event(function (gun, ctx, err, data) {
	      if (err || !ctx.soul) {
	        return;
	      }
	      if (data && !_obj2.default.empty(data, _reserved2.default.meta)) {
	        return;
	      }
	      var end = gun.__.by(ctx.soul);
	      end.end = !end.end || end.end < 0 ? 1 : end.end + 1;
	    }, -999);
	  }; /**
	      * Created by Paul on 9/7/2016.
	      */
	
	  exports.default = Bindings;
	  module.exports = exports['default'];
	});

/***/ },
/* 39 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(30), __webpack_require__(5), __webpack_require__(6), __webpack_require__(17), __webpack_require__(19), __webpack_require__(11), __webpack_require__(16)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../bindings'), require('../utilities/text'), require('../utilities/obj'), require('../is/node'), require('../is/rel'), require('../events'), require('../console'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.bindings, global.text, global.obj, global.node, global.rel, global.events, global.console);
	    global.key = mod.exports;
	  }
	})(this, function (module, exports, _bindings, _text, _obj, _node, _rel, _events, _console) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.default = function () {
	    (0, _bindings.keyBindings)();
	    return function (key, cb, opt) {
	      var gun = this;
	      opt = _text2.default.is(opt) ? { soul: opt } : opt || {};
	      cb = cb || function () {};
	      cb.hash = {};
	      if (!_text2.default.is(key) || !key) {
	        return cb.call(gun, { err: (0, _console2.default)('No key!') }), gun;
	      }
	      function index(at) {
	        var ctx = { node: gun.__.graph[at.soul] };
	        if (at.soul === key || at.key === key) {
	          return;
	        }
	        if (cb.hash[at.hash = at.hash || _events2.default.at.hash(at)]) {
	          return;
	        }
	        cb.hash[at.hash] = true;
	        ctx.obj = 1 === _node2.default.soul(ctx.node, 'key') ? _obj2.default.copy(ctx.node) : _obj2.default.put({}, at.soul, _rel2.default.ify(at.soul));
	        _obj2.default.as((ctx.put = _node2.default.ify(ctx.obj, key, true))._, 'key', 1);
	        gun.__.gun.put(ctx.put, function (err, ok) {
	          cb.call(this, err, ok);
	        }, { chain: opt.chain, key: true, init: true });
	      }
	
	      if (opt.soul) {
	        index({ soul: opt.soul });
	        return gun;
	      }
	      if (gun === gun.back) {
	        cb.call(gun, { err: (0, _console2.default)('You have no context to `.key`', key, '!') });
	      } else {
	        gun._.at('soul').map(index);
	      }
	      return gun;
	    };
	  }();
	
	  module.exports = exports['default'];
	});

/***/ },
/* 40 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(30), __webpack_require__(3), __webpack_require__(5), __webpack_require__(9), __webpack_require__(6), __webpack_require__(11), __webpack_require__(17), __webpack_require__(19), __webpack_require__(16)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../bindings'), require('../utilities/base'), require('../utilities/text'), require('../utilities/list'), require('../utilities/obj'), require('../events'), require('../is/node'), require('../is/rel'), require('../console'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.bindings, global.base, global.text, global.list, global.obj, global.events, global.node, global.rel, global.console);
	    global.path = mod.exports;
	  }
	})(this, function (module, exports, _bindings, _base, _text, _list, _obj, _events, _node, _rel, _console) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.default = function () {
	    (0, _bindings.pathBindings)();
	    return function (path, cb, opt) {
	      opt = opt || {};
	      cb = cb || function () {
	        var cb = function cb() {};
	        cb.no = true;
	        return cb;
	      }();
	      cb.hash = {};
	      var gun = this,
	          chain = gun.chain(),
	          f,
	          c,
	          u;
	      if (!_list2.default.is(path)) {
	        if (!_text2.default.is(path)) {
	          if (!_base2.default.num.is(path)) {
	            // if not a list, text, or number
	            return cb.call(chain, { err: (0, _console2.default)("Invalid path '" + path + "'!") }), chain; // then complain
	          } else {
	            return this.path(path + '', cb, opt);
	          }
	        } else {
	          return this.path(path.split('.'), cb, opt);
	        }
	      } // else coerce upward to a list.
	      if (gun === gun.back) {
	        cb.call(chain, opt.put ? null : { err: (0, _console2.default)('You have no context to `.path`', path, '!') }, opt.put ? gun.__.graph[(path || [])[0]] : u);
	        return chain;
	      }
	      gun._.at('path:' + path[0]).event(function (at) {
	        if (opt.done) {
	          this.off();
	          return;
	        } // TODO: BUG - THIS IS A FIX FOR A BUG! TEST #"context no double emit", COMMENT THIS LINE OUT AND SEE IT FAIL!
	        var ctx = { soul: at.soul, field: at.field, by: gun.__.by(at.soul) },
	            field = path[0];
	        var on = _obj2.default.as(cb.hash, at.hash, {
	          off: function off() {}
	        });
	        if (at.soul === on.soul) {
	          return;
	        } else {
	          on.off();
	        }
	        if (ctx.rel = (0, _rel2.default)(at.value) || (0, _rel2.default)(at.at && at.at.value)) {
	          if (opt.put && 1 === path.length) {
	            return cb.call(ctx.by.chain || chain, null, _node2.default.soul.ify({}, ctx.rel));
	          }
	          var get = function get(err, node) {
	            if (!err && 1 !== path.length) {
	              return;
	            }
	            cb.call(this, err, node, field);
	          };
	          ctx.opt = {
	            chain: opt.chain || chain,
	            put: opt.put,
	            path: { soul: at.at && at.at.soul || at.soul, field: field }
	          };
	          gun.__.gun.get(ctx.rel || at.soul, cb.no ? null : get, ctx.opt);
	          (opt.on = cb.hash[at.hash] = on = ctx.opt.on).soul = at.soul; // TODO: BUG! CB getting reused as the hash point for multiple paths potentially! Could cause problems!
	          return;
	        }
	        if (1 === path.length) {
	          cb.call(ctx.by.chain || chain, null, at.value, ctx.field);
	        }
	        chain._.at('soul').emit(at).chain(opt.chain);
	      });
	      gun._.at('null').only(function (at) {
	        if (!at.field) {
	          return;
	        }
	        if (at.not) {
	          gun.put({}, null, { init: true });
	          if (opt.init || gun.__.opt.init) {
	            return;
	          }
	        }
	        (at = _events2.default.at.copy(at)).field = path[0];
	        at.not = true;
	        chain._.at('null').emit(at).chain(opt.chain);
	      });
	      gun._.at('end').event(function (at) {
	        this.off();
	        if (at.at && at.at.field === path[0]) {
	          return;
	        } // TODO: BUG! THIS FIXES SO MANY PROBLEMS BUT DOES IT CATCH VARYING SOULS EDGE CASE?
	        var ctx = { by: gun.__.by(at.soul) };
	        if (_obj2.default.has(ctx.by.node, path[0])) {
	          return;
	        }
	        (at = _events2.default.at.copy(at)).field = path[0];
	        at.not = true;
	        cb.call(ctx.by.chain || chain, null);
	        chain._.at('null').emit(at).chain(opt.chain);
	      });
	      if (path.length > 1) {
	        (c = chain.path(path.slice(1), cb, opt)).back = gun;
	      }
	      return c || chain;
	    };
	  }();
	
	  module.exports = exports['default'];
	});

/***/ },
/* 41 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(3), __webpack_require__(19), __webpack_require__(17), __webpack_require__(16)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/base'), require('../is/rel'), require('../is/node'), require('../console'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.base, global.rel, global.node, global.console);
	    global.map = mod.exports;
	  }
	})(this, function (module, exports, _base, _rel, _node, _console) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (cb, opt) {
	    var u,
	        gun = this,
	        chain = gun.chain();
	    cb = cb || function () {};
	    cb.hash = {};
	    opt = _base2.default.bi.is(opt) ? { change: opt } : opt || {};
	    opt.change = _base2.default.bi.is(opt.change) ? opt.change : true;
	    function path(err, val, field) {
	      if (err || val === u) {
	        return;
	      }
	      cb.call(this, val, field);
	    }
	
	    function each(val, field) {
	      //if(!IsRel(val)){ path.call(this.gun, null, val, field);return;}
	      if (opt.node) {
	        if (!(0, _rel2.default)(val)) {
	          return;
	        }
	      }
	      cb.hash[this.soul + field] = cb.hash[this.soul + field] || this.gun.path(field, path, { chain: chain, via: 'map' }); // TODO: path should reuse itself! We shouldn't have to do it ourselves.
	      // TODO:
	      // 1. Ability to turn off an event. // automatically happens within path since reusing is manual?
	      // 2. Ability to pass chain context to fire on. // DONE
	      // 3. Pseudoness handled for us. // DONE
	      // 4. Reuse. // MANUALLY DONE
	    }
	
	    function map(at) {
	      var ref = gun.__.by(at.soul).chain || gun;
	      (0, _node2.default)(at.change, each, { gun: ref, soul: at.soul });
	    }
	
	    gun.on(map, { raw: true, change: true }); // TODO: ALLOW USER TO DO map change false!
	    if (gun === gun.back) {
	      (0, _console2.default)('You have no context to `.map`!');
	    }
	    return chain;
	  };
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  ; /**
	     * Created by Paul on 9/8/2016.
	     */

	  module.exports = exports['default'];
	});

/***/ },
/* 42 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(30), __webpack_require__(9), __webpack_require__(6), __webpack_require__(11), __webpack_require__(3), __webpack_require__(1), __webpack_require__(16)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../bindings'), require('../utilities/list'), require('../utilities/obj'), require('../events'), require('../utilities/base'), require('../reserved'), require('../console'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.bindings, global.list, global.obj, global.events, global.base, global.reserved, global.console);
	    global.val = mod.exports;
	  }
	})(this, function (module, exports, _bindings, _list, _obj, _events, _base, _reserved, _console) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _list2 = _interopRequireDefault(_list);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  exports.default = function () {
	    (0, _bindings.valBindings)();
	    return function (cb, opt) {
	      var gun = this,
	          args = _list2.default.slit.call(arguments);
	      cb = _base2.default.fns.is(cb) ? cb : function (val, field) {
	        root.console.log.apply(root.console, args.concat([field && (field += ':'), val]));
	      };
	      cb.hash = {};
	      opt = opt || {};
	      function val(at) {
	        var ctx = {
	          by: gun.__.by(at.soul),
	          at: at.at || at
	        },
	            node = ctx.by.node,
	            field = ctx.at.field,
	            hash = _events2.default.at.hash({
	          soul: ctx.at.key || ctx.at.soul,
	          field: field
	        });
	        if (cb.hash[hash]) {
	          return;
	        }
	        if (at.field && _obj2.default.has(node, at.field)) {
	          return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, _obj2.default.copy(node[at.field]), at.field);
	        }
	        if (!opt.empty && _obj2.default.empty(node, _reserved2.default.meta)) {
	          return;
	        } // TODO: CLEAN UP! .on already does this without the .raw!
	        if (ctx.by.end < 0) {
	          return;
	        }
	        return cb.hash[hash] = true, cb.call(ctx.by.chain || gun, _obj2.default.copy(node), field);
	      }
	
	      gun.on(val, { raw: true });
	      if (gun === gun.back) {
	        (0, _console2.default)('You have no context to `.val`!');
	      }
	      return gun;
	    };
	  }();
	
	  module.exports = exports['default'];
	});

/***/ },
/* 43 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(6), __webpack_require__(5), __webpack_require__(16), __webpack_require__(18)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/obj'), require('../utilities/text'), require('../console'), require('../is/base'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.obj, global.text, global.console, global.base);
	    global.not = mod.exports;
	  }
	})(this, function (module, exports, _obj, _text, _console, _base) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (cb, opt) {
	    var gun = this,
	        chain = gun.chain();
	    cb = cb || function () {};
	    opt = opt || {};
	    function not(at, e) {
	      if (at.field) {
	        if (_obj2.default.has(gun.__.by(at.soul).node, at.field)) {
	          return _obj2.default.del(at, 'not'), chain._.at(e).emit(at);
	        }
	      } else if (at.soul && gun.__.by(at.soul).node) {
	        return _obj2.default.del(at, 'not'), chain._.at(e).emit(at);
	      }
	      if (!at.not) {
	        return;
	      }
	      var kick = function kick(next) {
	        if (++kick.c) {
	          return (0, _console2.default)("Warning! Multiple `not` resumes!");
	        }
	        next._.at.all(function (on, e) {
	          // TODO: BUG? Switch back to .at? I think .on is actually correct so it doesn't memorize. // TODO: BUG! What about other events?
	          chain._.at(e).emit(on);
	        });
	      };
	      kick.c = -1;
	      kick.chain = gun.chain();
	      kick.next = cb.call(kick.chain, opt.raw ? at : at.field || at.soul || at.not, kick);
	      kick.soul = _text2.default.random();
	      if ((0, _base2.default)(kick.next)) {
	        kick(kick.next);
	      }
	      kick.chain._.at('soul').emit({ soul: kick.soul, field: at.field, not: true, via: 'not' });
	    }
	
	    gun._.at.all(not);
	    if (gun === gun.back) {
	      (0, _console2.default)('You have no context to `.not`!');
	    }
	    chain._.not = true; // TODO: CLEAN UP! Would be ideal if we could accomplish this in a more elegant way.
	    return chain;
	  };
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _base2 = _interopRequireDefault(_base);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  ; /**
	     * Created by Paul on 9/8/2016.
	     */

	  module.exports = exports['default'];
	});

/***/ },
/* 44 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(18), __webpack_require__(16), __webpack_require__(19), __webpack_require__(17), __webpack_require__(6)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../is/base'), require('../console'), require('../is/rel'), require('../is/node'), require('../utilities/obj'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.base, global.console, global.rel, global.node, global.obj);
	    global.set = mod.exports;
	  }
	})(this, function (module, exports, _base, _console, _rel, _node, _obj) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (item, cb, opt) {
	    var gun = this,
	        ctx = {},
	        chain;
	    cb = cb || function () {};
	    if (!(0, _base2.default)(item)) {
	      return cb.call(gun, { err: (0, _console2.default)('Set only supports node references currently!') }), gun;
	    } // TODO: Bug? Should we return not gun on error?
	    (ctx.chain = item.chain()).back = gun;
	    ctx.chain._ = item._;
	    item.val(function (node) {
	      // TODO: BUG! Return proxy chain with back = list.
	      if (ctx.done) {
	        return;
	      }
	      ctx.done = true;
	      var put = {},
	          soul = _node2.default.soul(node);
	      if (!soul) {
	        return cb.call(gun, { err: (0, _console2.default)('Only a node can be linked! Not "' + node + '"!') });
	      }
	      gun.put(_obj2.default.put(put, soul, _rel2.default.ify(soul)), cb, opt);
	    });
	    return ctx.chain;
	  };
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	
	  ;
	  module.exports = exports['default'];
	});

/***/ },
/* 45 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(5), __webpack_require__(6), __webpack_require__(17)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/text'), require('../utilities/obj'), require('../is/node'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.text, global.obj, global.node);
	    global.init = mod.exports;
	  }
	})(this, function (module, exports, _text, _obj, _node) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (cb, opt) {
	    var gun = this;
	    gun._.at('null').event(function (at) {
	      if (!at.not) {
	        return;
	      } // TODO: BUG! This check is synchronous but it could be asynchronous!
	      var ctx = { by: gun.__.by(at.soul) };
	      this.off();
	      if (at.field) {
	        if (_obj2.default.has(ctx.by.node, at.field)) {
	          return;
	        }
	        gun._.at('soul').emit({ soul: at.soul, field: at.field, not: true });
	        return;
	      }
	      if (at.soul) {
	        if (ctx.by.node) {
	          return;
	        }
	        var soul = _text2.default.random();
	        gun.__.gun.put(_node2.default.soul.ify({}, soul), null, { init: true });
	        gun.__.gun.key(at.soul, null, soul);
	      }
	    }, { raw: true });
	    return gun;
	  };
	
	  var _text2 = _interopRequireDefault(_text);
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/8/2016.
	   */
	
	  ;
	  module.exports = exports['default'];
	});

/***/ },
/* 46 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(6), __webpack_require__(11), __webpack_require__(1), __webpack_require__(16)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('../utilities/obj'), require('../events'), require('../reserved'), require('../console'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.obj, global.events, global.reserved, global.console);
	    global.on = mod.exports;
	  }
	})(this, function (module, exports, _obj, _events, _reserved, _console) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  exports.default = function (cb, opt) {
	    // on subscribes to any changes on the souls.
	    var gun = this,
	        u;
	    opt = _obj2.default.is(opt) ? opt : { change: opt };
	    cb = cb || function () {};
	    function map(at) {
	      opt.on = opt.on || this;
	      var ctx = { by: gun.__.by(at.soul) },
	          change = ctx.by.node;
	      if (opt.on.stat && opt.on.stat.first) {
	        (at = _events2.default.at.copy(at)).change = ctx.by.node;
	      }
	      if (opt.raw) {
	        return cb.call(opt.on, at);
	      }
	      if (opt.once) {
	        this.off();
	      }
	      if (opt.change) {
	        change = at.change;
	      }
	      if (!opt.empty && _obj2.default.empty(change, _reserved2.default.meta)) {
	        return;
	      }
	      cb.call(ctx.by.chain || gun, _obj2.default.copy(at.field ? change[at.field] : change), at.field || at.at && at.at.field);
	    };
	    opt.on = gun._.at('soul').map(map);
	    if (gun === gun.back) {
	      (0, _console2.default)('You have no context to `.on`!');
	    }
	    return gun;
	  };
	
	  var _obj2 = _interopRequireDefault(_obj);
	
	  var _events2 = _interopRequireDefault(_events);
	
	  var _reserved2 = _interopRequireDefault(_reserved);
	
	  var _console2 = _interopRequireDefault(_console);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  ; /**
	     * Created by Paul on 9/8/2016.
	     */

	  module.exports = exports['default'];
	});

/***/ },
/* 47 */
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;(function (global, factory) {
	  if (true) {
	    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [module, exports, __webpack_require__(18), __webpack_require__(19), __webpack_require__(17), __webpack_require__(23)], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
	  } else if (typeof exports !== "undefined") {
	    factory(module, exports, require('./base'), require('./rel'), require('./node'), require('./graph'));
	  } else {
	    var mod = {
	      exports: {}
	    };
	    factory(mod, mod.exports, global.base, global.rel, global.node, global.graph);
	    global.index = mod.exports;
	  }
	})(this, function (module, exports, _base, _rel, _node, _graph) {
	  'use strict';
	
	  Object.defineProperty(exports, "__esModule", {
	    value: true
	  });
	
	  var _base2 = _interopRequireDefault(_base);
	
	  var _rel2 = _interopRequireDefault(_rel);
	
	  var _node2 = _interopRequireDefault(_node);
	
	  var _graph2 = _interopRequireDefault(_graph);
	
	  function _interopRequireDefault(obj) {
	    return obj && obj.__esModule ? obj : {
	      default: obj
	    };
	  }
	
	  /**
	   * Created by Paul on 9/7/2016.
	   */
	
	  _base2.default.rel = _rel2.default;
	
	  //node for the sake of tests
	
	
	  //rel for the sake of tests
	
	  _base2.default.node = _node2.default;
	  //graph for the sake of tests
	
	  _base2.default.graph = _graph2.default;
	
	  exports.default = _base2.default;
	  module.exports = exports['default'];
	});

/***/ }
/******/ ])
});
;
//# sourceMappingURL=gun.js.map