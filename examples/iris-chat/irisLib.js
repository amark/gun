(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory(require('gun')) :
	typeof define === 'function' && define.amd ? define(['gun'], factory) :
	(global.irisLib = factory(global.Gun));
}(this, (function (Gun) { 'use strict';

	Gun = Gun && Gun.hasOwnProperty('default') ? Gun['default'] : Gun;

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	// 7.2.1 RequireObjectCoercible(argument)
	var _defined = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};

	// 7.1.13 ToObject(argument)

	var _toObject = function (it) {
	  return Object(_defined(it));
	};

	var hasOwnProperty = {}.hasOwnProperty;
	var _has = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};

	var toString = {}.toString;

	var _cof = function (it) {
	  return toString.call(it).slice(8, -1);
	};

	// fallback for non-array-like ES3 and non-enumerable old V8 strings

	// eslint-disable-next-line no-prototype-builtins
	var _iobject = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return _cof(it) == 'String' ? it.split('') : Object(it);
	};

	// to indexed object, toObject with fallback for non-array-like ES3 strings


	var _toIobject = function (it) {
	  return _iobject(_defined(it));
	};

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	var _toInteger = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};

	// 7.1.15 ToLength

	var min = Math.min;
	var _toLength = function (it) {
	  return it > 0 ? min(_toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};

	var max = Math.max;
	var min$1 = Math.min;
	var _toAbsoluteIndex = function (index, length) {
	  index = _toInteger(index);
	  return index < 0 ? max(index + length, 0) : min$1(index, length);
	};

	// false -> Array#indexOf
	// true  -> Array#includes



	var _arrayIncludes = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = _toIobject($this);
	    var length = _toLength(O.length);
	    var index = _toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};

	var _core = createCommonjsModule(function (module) {
	var core = module.exports = { version: '2.6.9' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef
	});
	var _core_1 = _core.version;

	var _global = createCommonjsModule(function (module) {
	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef
	});

	var _library = true;

	var _shared = createCommonjsModule(function (module) {
	var SHARED = '__core-js_shared__';
	var store = _global[SHARED] || (_global[SHARED] = {});

	(module.exports = function (key, value) {
	  return store[key] || (store[key] = value !== undefined ? value : {});
	})('versions', []).push({
	  version: _core.version,
	  mode: 'pure',
	  copyright: '© 2019 Denis Pushkarev (zloirock.ru)'
	});
	});

	var id = 0;
	var px = Math.random();
	var _uid = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};

	var shared = _shared('keys');

	var _sharedKey = function (key) {
	  return shared[key] || (shared[key] = _uid(key));
	};

	var arrayIndexOf = _arrayIncludes(false);
	var IE_PROTO = _sharedKey('IE_PROTO');

	var _objectKeysInternal = function (object, names) {
	  var O = _toIobject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) _has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (_has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};

	// IE 8- don't enum bug keys
	var _enumBugKeys = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)



	var _objectKeys = Object.keys || function keys(O) {
	  return _objectKeysInternal(O, _enumBugKeys);
	};

	var _aFunction = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};

	// optional / simple context binding

	var _ctx = function (fn, that, length) {
	  _aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};

	var _isObject = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};

	var _anObject = function (it) {
	  if (!_isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};

	var _fails = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};

	// Thank's IE8 for his funny defineProperty
	var _descriptors = !_fails(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});

	var document$1 = _global.document;
	// typeof document.createElement is 'object' in old IE
	var is = _isObject(document$1) && _isObject(document$1.createElement);
	var _domCreate = function (it) {
	  return is ? document$1.createElement(it) : {};
	};

	var _ie8DomDefine = !_descriptors && !_fails(function () {
	  return Object.defineProperty(_domCreate('div'), 'a', { get: function () { return 7; } }).a != 7;
	});

	// 7.1.1 ToPrimitive(input [, PreferredType])

	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	var _toPrimitive = function (it, S) {
	  if (!_isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !_isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !_isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};

	var dP = Object.defineProperty;

	var f = _descriptors ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  _anObject(O);
	  P = _toPrimitive(P, true);
	  _anObject(Attributes);
	  if (_ie8DomDefine) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};

	var _objectDp = {
		f: f
	};

	var _propertyDesc = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};

	var _hide = _descriptors ? function (object, key, value) {
	  return _objectDp.f(object, key, _propertyDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};

	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var IS_WRAP = type & $export.W;
	  var exports = IS_GLOBAL ? _core : _core[name] || (_core[name] = {});
	  var expProto = exports[PROTOTYPE];
	  var target = IS_GLOBAL ? _global : IS_STATIC ? _global[name] : (_global[name] || {})[PROTOTYPE];
	  var key, own, out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && _has(exports, key)) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? _ctx(out, _global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function (C) {
	      var F = function (a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0: return new C();
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? _ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) _hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	var _export = $export;

	// most Object methods by ES6 should accept primitives



	var _objectSap = function (KEY, exec) {
	  var fn = (_core.Object || {})[KEY] || Object[KEY];
	  var exp = {};
	  exp[KEY] = exec(fn);
	  _export(_export.S + _export.F * _fails(function () { fn(1); }), 'Object', exp);
	};

	// 19.1.2.14 Object.keys(O)



	_objectSap('keys', function () {
	  return function keys(it) {
	    return _objectKeys(_toObject(it));
	  };
	});

	var keys = _core.Object.keys;

	var keys$1 = createCommonjsModule(function (module) {
	module.exports = { "default": keys, __esModule: true };
	});

	var _Object$keys = unwrapExports(keys$1);

	var classCallCheck = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;

	exports.default = function (instance, Constructor) {
	  if (!(instance instanceof Constructor)) {
	    throw new TypeError("Cannot call a class as a function");
	  }
	};
	});

	var _classCallCheck = unwrapExports(classCallCheck);

	/**
	* Gun object collection that provides tools for indexing and search. Decentralize everything!
	*
	* If opt.class is passed, object.serialize() and opt.class.deserialize() must be defined.
	*
	* Supports search from multiple indexes.
	* For example, retrieve message feed from your own index and your friends' indexes.
	*
	* TODO: aggregation
	* TODO: example
	* TODO: scrollable and stretchable "search result window"
	* @param {Object} opt {gun, class, indexes = [], askPeers = true, name = class.name}
	*/

	var Collection = function () {
	  function Collection() {
	    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    _classCallCheck(this, Collection);

	    if (!opt.gun) {
	      throw new Error('Missing opt.gun');
	    }
	    if (!(opt.class || opt.name)) {
	      throw new Error('You must supply either opt.name or opt.class');
	    }
	    this.class = opt.class;
	    this.serializer = opt.serializer;
	    if (this.class && !this.class.deserialize && !this.serializer) {
	      throw new Error('opt.class must have deserialize() method or opt.serializer must be defined');
	    }
	    this.name = opt.name || opt.class.name;
	    this.gun = opt.gun;
	    this.indexes = opt.indexes || [];
	    this.indexer = opt.indexer;
	    this.askPeers = typeof opt.askPeers === 'undefined' ? true : opt.askPeers;
	  }

	  /**
	  * @return {String} id of added object, which can be used for collection.get(id)
	  */


	  Collection.prototype.put = function put(object) {
	    var opt = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    var data = object;
	    if (this.serializer) {
	      data = this.serializer.serialize(object);
	    }if (this.class) {
	      data = object.serialize();
	    }
	    // TODO: optionally use gun hash table
	    var node = void 0;
	    if (opt.id || data.id) {
	      node = this.gun.get(this.name).get('id').get(opt.id || data.id).put(data); // TODO: use .top()
	    } else if (object.getId) {
	      node = this.gun.get(this.name).get('id').get(object.getId()).put(data);
	    } else {
	      node = this.gun.get(this.name).get('id').set(data);
	    }
	    this._addToIndexes(data, node);
	    return data.id || Gun.node.soul(node) || node._.link;
	  };

	  Collection.prototype._addToIndexes = async function _addToIndexes(serializedObject, node) {
	    var _this = this;

	    if (Gun.node.is(serializedObject)) {
	      serializedObject = await serializedObject.open();
	    }
	    var addToIndex = function addToIndex(indexName, indexKey) {
	      _this.gun.get(_this.name).get(indexName).get(indexKey).put(node);
	    };
	    if (this.indexer) {
	      var customIndexes = await this.indexer(serializedObject);
	      var customIndexKeys = _Object$keys(customIndexes);
	      for (var i = 0; i < customIndexKeys; i++) {
	        var key = customIndexKeys[i];
	        addToIndex(key, customIndexes[key]);
	      }
	    }
	    for (var _i = 0; _i < this.indexes.length; _i++) {
	      var indexName = this.indexes[_i];
	      if (Object.prototype.hasOwnProperty.call(serializedObject, indexName)) {
	        addToIndex(indexName, serializedObject[indexName]);
	      }
	    }
	  };

	  // TODO: method for terminating the query
	  // TODO: query ttl. https://mongodb.github.io/node-mongodb-native/2.0/api/Collection.html
	  /**
	  * @param {Object} opt {callback, id, selector, limit, orderBy}
	  */


	  Collection.prototype.get = function get() {
	    var _this2 = this;

	    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    if (!opt.callback) {
	      return;
	    }
	    var results = 0;
	    var matcher = function matcher(data, id, node) {
	      if (!data) {
	        return;
	      }
	      if (opt.limit && results++ >= opt.limit) {
	        return; // TODO: terminate query
	      }
	      if (opt.selector) {
	        // TODO: deep compare selector object?
	        var keys = _Object$keys(opt.selector);
	        for (var i = 0; i < keys.length; i++) {
	          var key = keys[i];
	          if (!Object.prototype.hasOwnProperty.call(data, key)) {
	            return;
	          }
	          var v1 = void 0,
	              v2 = void 0;
	          if (opt.caseSensitive === false) {
	            v1 = data[key].toLowerCase();
	            v2 = opt.selector[key].toLowerCase();
	          } else {
	            v1 = data[key];
	            v2 = opt.selector[key];
	          }
	          if (v1 !== v2) {
	            return;
	          }
	        }
	      }
	      if (opt.query) {
	        // TODO: use gun.get() lt / gt operators
	        var _keys = _Object$keys(opt.query);
	        for (var _i2 = 0; _i2 < _keys.length; _i2++) {
	          var _key = _keys[_i2];
	          if (!Object.prototype.hasOwnProperty.call(data, _key)) {
	            return;
	          }
	          var _v = void 0,
	              _v2 = void 0;
	          if (opt.caseSensitive === false) {
	            _v = data[_key].toLowerCase();
	            _v2 = opt.query[_key].toLowerCase();
	          } else {
	            _v = data[_key];
	            _v2 = opt.query[_key];
	          }
	          if (_v.indexOf(_v2) !== 0) {
	            return;
	          }
	        }
	      }
	      if (_this2.serializer) {
	        opt.callback(_this2.serializer.deserialize(data, { id: id, gun: node.$ }));
	      } else if (_this2.class) {
	        opt.callback(_this2.class.deserialize(data, { id: id, gun: node.$ }));
	      } else {
	        opt.callback(data);
	      }
	    };

	    if (opt.id) {
	      opt.limit = 1;
	      this.gun.get(this.name).get('id').get(opt.id).on(matcher);
	      return;
	    }

	    var indexName = 'id';
	    if (opt.orderBy && this.indexes.indexOf(opt.orderBy) > -1) {
	      indexName = opt.orderBy;
	    }

	    // TODO: query from indexes
	    this.gun.get(this.name).get(indexName).map().on(matcher); // TODO: limit .open recursion
	    if (this.askPeers) {
	      this.gun.get('trustedIndexes').on(function (val, key) {
	        _this2.gun.user(key).get(_this2.name).get(indexName).map().on(matcher);
	      });
	    }
	  };

	  Collection.prototype.delete = function _delete() {
	    // gun.unset()
	  };

	  return Collection;
	}();

	var $JSON = _core.JSON || (_core.JSON = { stringify: JSON.stringify });
	var stringify = function stringify(it) { // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};

	var stringify$1 = createCommonjsModule(function (module) {
	module.exports = { "default": stringify, __esModule: true };
	});

	var _JSON$stringify = unwrapExports(stringify$1);

	// true  -> String#at
	// false -> String#codePointAt
	var _stringAt = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(_defined(that));
	    var i = _toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};

	var _redefine = _hide;

	var _iterators = {};

	var _objectDps = _descriptors ? Object.defineProperties : function defineProperties(O, Properties) {
	  _anObject(O);
	  var keys = _objectKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) _objectDp.f(O, P = keys[i++], Properties[P]);
	  return O;
	};

	var document$2 = _global.document;
	var _html = document$2 && document$2.documentElement;

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])



	var IE_PROTO$1 = _sharedKey('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE$1 = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = _domCreate('iframe');
	  var i = _enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  _html.appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE$1][_enumBugKeys[i]];
	  return createDict();
	};

	var _objectCreate = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE$1] = _anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE$1] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO$1] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : _objectDps(result, Properties);
	};

	var _wks = createCommonjsModule(function (module) {
	var store = _shared('wks');

	var Symbol = _global.Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : _uid)('Symbol.' + name));
	};

	$exports.store = store;
	});

	var def = _objectDp.f;

	var TAG = _wks('toStringTag');

	var _setToStringTag = function (it, tag, stat) {
	  if (it && !_has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};

	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	_hide(IteratorPrototype, _wks('iterator'), function () { return this; });

	var _iterCreate = function (Constructor, NAME, next) {
	  Constructor.prototype = _objectCreate(IteratorPrototype, { next: _propertyDesc(1, next) });
	  _setToStringTag(Constructor, NAME + ' Iterator');
	};

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)


	var IE_PROTO$2 = _sharedKey('IE_PROTO');
	var ObjectProto = Object.prototype;

	var _objectGpo = Object.getPrototypeOf || function (O) {
	  O = _toObject(O);
	  if (_has(O, IE_PROTO$2)) return O[IE_PROTO$2];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};

	var ITERATOR = _wks('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	var _iterDefine = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  _iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = _objectGpo($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      _setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!_library && typeof IteratorPrototype[ITERATOR] != 'function') _hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!_library || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    _hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  _iterators[NAME] = $default;
	  _iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) _redefine(proto, key, methods[key]);
	    } else _export(_export.P + _export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};

	var $at = _stringAt(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	_iterDefine(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});

	var _iterStep = function (done, value) {
	  return { value: value, done: !!done };
	};

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	var es6_array_iterator = _iterDefine(Array, 'Array', function (iterated, kind) {
	  this._t = _toIobject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return _iterStep(1);
	  }
	  if (kind == 'keys') return _iterStep(0, index);
	  if (kind == 'values') return _iterStep(0, O[index]);
	  return _iterStep(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	_iterators.Arguments = _iterators.Array;

	var TO_STRING_TAG = _wks('toStringTag');

	var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
	  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
	  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
	  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
	  'TextTrackList,TouchList').split(',');

	for (var i = 0; i < DOMIterables.length; i++) {
	  var NAME = DOMIterables[i];
	  var Collection$1 = _global[NAME];
	  var proto = Collection$1 && Collection$1.prototype;
	  if (proto && !proto[TO_STRING_TAG]) _hide(proto, TO_STRING_TAG, NAME);
	  _iterators[NAME] = _iterators.Array;
	}

	// getting tag from 19.1.3.6 Object.prototype.toString()

	var TAG$1 = _wks('toStringTag');
	// ES3 wrong here
	var ARG = _cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	var _classof = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG$1)) == 'string' ? T
	    // builtinTag case
	    : ARG ? _cof(O)
	    // ES3 arguments fallback
	    : (B = _cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};

	var _anInstance = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};

	// call something on iterator step with safe closing on error

	var _iterCall = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(_anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) _anObject(ret.call(iterator));
	    throw e;
	  }
	};

	// check on default Array iterator

	var ITERATOR$1 = _wks('iterator');
	var ArrayProto = Array.prototype;

	var _isArrayIter = function (it) {
	  return it !== undefined && (_iterators.Array === it || ArrayProto[ITERATOR$1] === it);
	};

	var ITERATOR$2 = _wks('iterator');

	var core_getIteratorMethod = _core.getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR$2]
	    || it['@@iterator']
	    || _iterators[_classof(it)];
	};

	var _forOf = createCommonjsModule(function (module) {
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : core_getIteratorMethod(iterable);
	  var f = _ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (_isArrayIter(iterFn)) for (length = _toLength(iterable.length); length > index; index++) {
	    result = entries ? f(_anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = _iterCall(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;
	});

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)


	var SPECIES = _wks('species');
	var _speciesConstructor = function (O, D) {
	  var C = _anObject(O).constructor;
	  var S;
	  return C === undefined || (S = _anObject(C)[SPECIES]) == undefined ? D : _aFunction(S);
	};

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	var _invoke = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};

	var process = _global.process;
	var setTask = _global.setImmediate;
	var clearTask = _global.clearImmediate;
	var MessageChannel = _global.MessageChannel;
	var Dispatch = _global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      _invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (_cof(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(_ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(_ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = _ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (_global.addEventListener && typeof postMessage == 'function' && !_global.importScripts) {
	    defer = function (id) {
	      _global.postMessage(id + '', '*');
	    };
	    _global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in _domCreate('script')) {
	    defer = function (id) {
	      _html.appendChild(_domCreate('script'))[ONREADYSTATECHANGE] = function () {
	        _html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(_ctx(run, id, 1), 0);
	    };
	  }
	}
	var _task = {
	  set: setTask,
	  clear: clearTask
	};

	var macrotask = _task.set;
	var Observer = _global.MutationObserver || _global.WebKitMutationObserver;
	var process$1 = _global.process;
	var Promise$1 = _global.Promise;
	var isNode = _cof(process$1) == 'process';

	var _microtask = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process$1.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process$1.nextTick(flush);
	    };
	  // browsers with MutationObserver, except iOS Safari - https://github.com/zloirock/core-js/issues/339
	  } else if (Observer && !(_global.navigator && _global.navigator.standalone)) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise$1 && Promise$1.resolve) {
	    // Promise.resolve without an argument throws an error in LG WebOS 2
	    var promise = Promise$1.resolve(undefined);
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(_global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};

	// 25.4.1.5 NewPromiseCapability(C)


	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = _aFunction(resolve);
	  this.reject = _aFunction(reject);
	}

	var f$1 = function (C) {
	  return new PromiseCapability(C);
	};

	var _newPromiseCapability = {
		f: f$1
	};

	var _perform = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};

	var navigator = _global.navigator;

	var _userAgent = navigator && navigator.userAgent || '';

	var _promiseResolve = function (C, x) {
	  _anObject(C);
	  if (_isObject(x) && x.constructor === C) return x;
	  var promiseCapability = _newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};

	var _redefineAll = function (target, src, safe) {
	  for (var key in src) {
	    if (safe && target[key]) target[key] = src[key];
	    else _hide(target, key, src[key]);
	  } return target;
	};

	var SPECIES$1 = _wks('species');

	var _setSpecies = function (KEY) {
	  var C = typeof _core[KEY] == 'function' ? _core[KEY] : _global[KEY];
	  if (_descriptors && C && !C[SPECIES$1]) _objectDp.f(C, SPECIES$1, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};

	var ITERATOR$3 = _wks('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR$3]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	} catch (e) { /* empty */ }

	var _iterDetect = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR$3]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR$3] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};

	var task = _task.set;
	var microtask = _microtask();




	var PROMISE = 'Promise';
	var TypeError$1 = _global.TypeError;
	var process$2 = _global.process;
	var versions = process$2 && process$2.versions;
	var v8 = versions && versions.v8 || '';
	var $Promise = _global[PROMISE];
	var isNode$1 = _classof(process$2) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = _newPromiseCapability.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[_wks('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode$1 || typeof PromiseRejectionEvent == 'function')
	      && promise.then(empty) instanceof FakePromise
	      // v8 6.6 (Node 10 and Chrome 66) have a bug with resolving custom thenables
	      // https://bugs.chromium.org/p/chromium/issues/detail?id=830565
	      // we can't detect it synchronously, so just check versions
	      && v8.indexOf('6.6') !== 0
	      && _userAgent.indexOf('Chrome/66') === -1;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return _isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then, exited;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value); // may throw
	            if (domain) {
	              domain.exit();
	              exited = true;
	            }
	          }
	          if (result === reaction.promise) {
	            reject(TypeError$1('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        if (domain && !exited) domain.exit();
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(_global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = _perform(function () {
	        if (isNode$1) {
	          process$2.emit('unhandledRejection', value, promise);
	        } else if (handler = _global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = _global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode$1 || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  return promise._h !== 1 && (promise._a || promise._c).length === 0;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(_global, function () {
	    var handler;
	    if (isNode$1) {
	      process$2.emit('rejectionHandled', promise);
	    } else if (handler = _global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError$1("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, _ctx($resolve, wrapper, 1), _ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    _anInstance(this, $Promise, PROMISE, '_h');
	    _aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(_ctx($resolve, this, 1), _ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = _redefineAll($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(_speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode$1 ? process$2.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = _ctx($resolve, promise, 1);
	    this.reject = _ctx($reject, promise, 1);
	  };
	  _newPromiseCapability.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE, { Promise: $Promise });
	_setToStringTag($Promise, PROMISE);
	_setSpecies(PROMISE);
	Wrapper = _core[PROMISE];

	// statics
	_export(_export.S + _export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	_export(_export.S + _export.F * (_library || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return _promiseResolve(_library && this === Wrapper ? $Promise : this, x);
	  }
	});
	_export(_export.S + _export.F * !(USE_NATIVE && _iterDetect(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = _perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      _forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = _perform(function () {
	      _forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});

	_export(_export.P + _export.R, 'Promise', { 'finally': function (onFinally) {
	  var C = _speciesConstructor(this, _core.Promise || _global.Promise);
	  var isFunction = typeof onFinally == 'function';
	  return this.then(
	    isFunction ? function (x) {
	      return _promiseResolve(C, onFinally()).then(function () { return x; });
	    } : onFinally,
	    isFunction ? function (e) {
	      return _promiseResolve(C, onFinally()).then(function () { throw e; });
	    } : onFinally
	  );
	} });

	// https://github.com/tc39/proposal-promise-try




	_export(_export.S, 'Promise', { 'try': function (callbackfn) {
	  var promiseCapability = _newPromiseCapability.f(this);
	  var result = _perform(callbackfn);
	  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
	  return promiseCapability.promise;
	} });

	var promise = _core.Promise;

	var promise$1 = createCommonjsModule(function (module) {
	module.exports = { "default": promise, __esModule: true };
	});

	var _Promise = unwrapExports(promise$1);

	var core_getIterator = _core.getIterator = function (it) {
	  var iterFn = core_getIteratorMethod(it);
	  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
	  return _anObject(iterFn.call(it));
	};

	var getIterator = core_getIterator;

	var getIterator$1 = createCommonjsModule(function (module) {
	module.exports = { "default": getIterator, __esModule: true };
	});

	var _getIterator = unwrapExports(getIterator$1);

	var f$2 = _wks;

	var _wksExt = {
		f: f$2
	};

	var iterator = _wksExt.f('iterator');

	var iterator$1 = createCommonjsModule(function (module) {
	module.exports = { "default": iterator, __esModule: true };
	});

	var _Symbol$iterator = unwrapExports(iterator$1);

	var _meta = createCommonjsModule(function (module) {
	var META = _uid('meta');


	var setDesc = _objectDp.f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !_fails(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!_isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!_has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !_has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};
	});
	var _meta_1 = _meta.KEY;
	var _meta_2 = _meta.NEED;
	var _meta_3 = _meta.fastKey;
	var _meta_4 = _meta.getWeak;
	var _meta_5 = _meta.onFreeze;

	var defineProperty = _objectDp.f;
	var _wksDefine = function (name) {
	  var $Symbol = _core.Symbol || (_core.Symbol = {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: _wksExt.f(name) });
	};

	var f$3 = Object.getOwnPropertySymbols;

	var _objectGops = {
		f: f$3
	};

	var f$4 = {}.propertyIsEnumerable;

	var _objectPie = {
		f: f$4
	};

	// all enumerable object keys, includes symbols



	var _enumKeys = function (it) {
	  var result = _objectKeys(it);
	  var getSymbols = _objectGops.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = _objectPie.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};

	// 7.2.2 IsArray(argument)

	var _isArray = Array.isArray || function isArray(arg) {
	  return _cof(arg) == 'Array';
	};

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)

	var hiddenKeys = _enumBugKeys.concat('length', 'prototype');

	var f$5 = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return _objectKeysInternal(O, hiddenKeys);
	};

	var _objectGopn = {
		f: f$5
	};

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window

	var gOPN = _objectGopn.f;
	var toString$1 = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	var f$6 = function getOwnPropertyNames(it) {
	  return windowNames && toString$1.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(_toIobject(it));
	};

	var _objectGopnExt = {
		f: f$6
	};

	var gOPD = Object.getOwnPropertyDescriptor;

	var f$7 = _descriptors ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = _toIobject(O);
	  P = _toPrimitive(P, true);
	  if (_ie8DomDefine) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (_has(O, P)) return _propertyDesc(!_objectPie.f.call(O, P), O[P]);
	};

	var _objectGopd = {
		f: f$7
	};

	// ECMAScript 6 symbols shim





	var META = _meta.KEY;





















	var gOPD$1 = _objectGopd.f;
	var dP$1 = _objectDp.f;
	var gOPN$1 = _objectGopnExt.f;
	var $Symbol = _global.Symbol;
	var $JSON$1 = _global.JSON;
	var _stringify = $JSON$1 && $JSON$1.stringify;
	var PROTOTYPE$2 = 'prototype';
	var HIDDEN = _wks('_hidden');
	var TO_PRIMITIVE = _wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = _shared('symbol-registry');
	var AllSymbols = _shared('symbols');
	var OPSymbols = _shared('op-symbols');
	var ObjectProto$1 = Object[PROTOTYPE$2];
	var USE_NATIVE$1 = typeof $Symbol == 'function' && !!_objectGops.f;
	var QObject = _global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE$2] || !QObject[PROTOTYPE$2].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = _descriptors && _fails(function () {
	  return _objectCreate(dP$1({}, 'a', {
	    get: function () { return dP$1(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD$1(ObjectProto$1, key);
	  if (protoDesc) delete ObjectProto$1[key];
	  dP$1(it, key, D);
	  if (protoDesc && it !== ObjectProto$1) dP$1(ObjectProto$1, key, protoDesc);
	} : dP$1;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _objectCreate($Symbol[PROTOTYPE$2]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE$1 && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto$1) $defineProperty(OPSymbols, key, D);
	  _anObject(it);
	  key = _toPrimitive(key, true);
	  _anObject(D);
	  if (_has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!_has(it, HIDDEN)) dP$1(it, HIDDEN, _propertyDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (_has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _objectCreate(D, { enumerable: _propertyDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP$1(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  _anObject(it);
	  var keys = _enumKeys(P = _toIobject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _objectCreate(it) : $defineProperties(_objectCreate(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = _toPrimitive(key, true));
	  if (this === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return false;
	  return E || !_has(this, key) || !_has(AllSymbols, key) || _has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = _toIobject(it);
	  key = _toPrimitive(key, true);
	  if (it === ObjectProto$1 && _has(AllSymbols, key) && !_has(OPSymbols, key)) return;
	  var D = gOPD$1(it, key);
	  if (D && _has(AllSymbols, key) && !(_has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN$1(_toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!_has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto$1;
	  var names = gOPN$1(IS_OP ? OPSymbols : _toIobject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (_has(AllSymbols, key = names[i++]) && (IS_OP ? _has(ObjectProto$1, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE$1) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = _uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto$1) $set.call(OPSymbols, value);
	      if (_has(this, HIDDEN) && _has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, _propertyDesc(1, value));
	    };
	    if (_descriptors && setter) setSymbolDesc(ObjectProto$1, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  _redefine($Symbol[PROTOTYPE$2], 'toString', function toString() {
	    return this._k;
	  });

	  _objectGopd.f = $getOwnPropertyDescriptor;
	  _objectDp.f = $defineProperty;
	  _objectGopn.f = _objectGopnExt.f = $getOwnPropertyNames;
	  _objectPie.f = $propertyIsEnumerable;
	  _objectGops.f = $getOwnPropertySymbols;

	  if (_descriptors && !_library) {
	    _redefine(ObjectProto$1, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  _wksExt.f = function (name) {
	    return wrap(_wks(name));
	  };
	}

	_export(_export.G + _export.W + _export.F * !USE_NATIVE$1, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)_wks(es6Symbols[j++]);

	for (var wellKnownSymbols = _objectKeys(_wks.store), k = 0; wellKnownSymbols.length > k;) _wksDefine(wellKnownSymbols[k++]);

	_export(_export.S + _export.F * !USE_NATIVE$1, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return _has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	_export(_export.S + _export.F * !USE_NATIVE$1, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// Chrome 38 and 39 `Object.getOwnPropertySymbols` fails on primitives
	// https://bugs.chromium.org/p/v8/issues/detail?id=3443
	var FAILS_ON_PRIMITIVES = _fails(function () { _objectGops.f(1); });

	_export(_export.S + _export.F * FAILS_ON_PRIMITIVES, 'Object', {
	  getOwnPropertySymbols: function getOwnPropertySymbols(it) {
	    return _objectGops.f(_toObject(it));
	  }
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON$1 && _export(_export.S + _export.F * (!USE_NATIVE$1 || _fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    $replacer = replacer = args[1];
	    if (!_isObject(replacer) && it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    if (!_isArray(replacer)) replacer = function (key, value) {
	      if (typeof $replacer == 'function') value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON$1, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE$2][TO_PRIMITIVE] || _hide($Symbol[PROTOTYPE$2], TO_PRIMITIVE, $Symbol[PROTOTYPE$2].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	_setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	_setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	_setToStringTag(_global.JSON, 'JSON', true);

	_wksDefine('asyncIterator');

	_wksDefine('observable');

	var symbol = _core.Symbol;

	var symbol$1 = createCommonjsModule(function (module) {
	module.exports = { "default": symbol, __esModule: true };
	});

	unwrapExports(symbol$1);

	var _typeof_1 = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _iterator2 = _interopRequireDefault(iterator$1);



	var _symbol2 = _interopRequireDefault(symbol$1);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};
	});

	var _typeof = unwrapExports(_typeof_1);

	var runtime = createCommonjsModule(function (module) {
	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	!(function(global) {

	  var Op = Object.prototype;
	  var hasOwn = Op.hasOwnProperty;
	  var undefined; // More compressible than void 0.
	  var $Symbol = typeof Symbol === "function" ? Symbol : {};
	  var iteratorSymbol = $Symbol.iterator || "@@iterator";
	  var asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator";
	  var toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
	  var runtime = global.regeneratorRuntime;
	  if (runtime) {
	    {
	      // If regeneratorRuntime is defined globally and we're in a module,
	      // make the exports object identical to regeneratorRuntime.
	      module.exports = runtime;
	    }
	    // Don't bother evaluating the rest of this file if the runtime was
	    // already defined globally.
	    return;
	  }

	  // Define the runtime globally (as expected by generated code) as either
	  // module.exports (if we're in a module) or a new, empty object.
	  runtime = global.regeneratorRuntime = module.exports;

	  function wrap(innerFn, outerFn, self, tryLocsList) {
	    // If outerFn provided and outerFn.prototype is a Generator, then outerFn.prototype instanceof Generator.
	    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator;
	    var generator = Object.create(protoGenerator.prototype);
	    var context = new Context(tryLocsList || []);

	    // The ._invoke method unifies the implementations of the .next,
	    // .throw, and .return methods.
	    generator._invoke = makeInvokeMethod(innerFn, self, context);

	    return generator;
	  }
	  runtime.wrap = wrap;

	  // Try/catch helper to minimize deoptimizations. Returns a completion
	  // record like context.tryEntries[i].completion. This interface could
	  // have been (and was previously) designed to take a closure to be
	  // invoked without arguments, but in all the cases we care about we
	  // already have an existing method we want to call, so there's no need
	  // to create a new function object. We can even get away with assuming
	  // the method takes exactly one argument, since that happens to be true
	  // in every case, so we don't have to touch the arguments object. The
	  // only additional allocation required is the completion record, which
	  // has a stable shape and so hopefully should be cheap to allocate.
	  function tryCatch(fn, obj, arg) {
	    try {
	      return { type: "normal", arg: fn.call(obj, arg) };
	    } catch (err) {
	      return { type: "throw", arg: err };
	    }
	  }

	  var GenStateSuspendedStart = "suspendedStart";
	  var GenStateSuspendedYield = "suspendedYield";
	  var GenStateExecuting = "executing";
	  var GenStateCompleted = "completed";

	  // Returning this object from the innerFn has the same effect as
	  // breaking out of the dispatch switch statement.
	  var ContinueSentinel = {};

	  // Dummy constructor functions that we use as the .constructor and
	  // .constructor.prototype properties for functions that return Generator
	  // objects. For full spec compliance, you may wish to configure your
	  // minifier not to mangle the names of these two functions.
	  function Generator() {}
	  function GeneratorFunction() {}
	  function GeneratorFunctionPrototype() {}

	  // This is a polyfill for %IteratorPrototype% for environments that
	  // don't natively support it.
	  var IteratorPrototype = {};
	  IteratorPrototype[iteratorSymbol] = function () {
	    return this;
	  };

	  var getProto = Object.getPrototypeOf;
	  var NativeIteratorPrototype = getProto && getProto(getProto(values([])));
	  if (NativeIteratorPrototype &&
	      NativeIteratorPrototype !== Op &&
	      hasOwn.call(NativeIteratorPrototype, iteratorSymbol)) {
	    // This environment has a native %IteratorPrototype%; use it instead
	    // of the polyfill.
	    IteratorPrototype = NativeIteratorPrototype;
	  }

	  var Gp = GeneratorFunctionPrototype.prototype =
	    Generator.prototype = Object.create(IteratorPrototype);
	  GeneratorFunction.prototype = Gp.constructor = GeneratorFunctionPrototype;
	  GeneratorFunctionPrototype.constructor = GeneratorFunction;
	  GeneratorFunctionPrototype[toStringTagSymbol] =
	    GeneratorFunction.displayName = "GeneratorFunction";

	  // Helper for defining the .next, .throw, and .return methods of the
	  // Iterator interface in terms of a single ._invoke method.
	  function defineIteratorMethods(prototype) {
	    ["next", "throw", "return"].forEach(function(method) {
	      prototype[method] = function(arg) {
	        return this._invoke(method, arg);
	      };
	    });
	  }

	  runtime.isGeneratorFunction = function(genFun) {
	    var ctor = typeof genFun === "function" && genFun.constructor;
	    return ctor
	      ? ctor === GeneratorFunction ||
	        // For the native GeneratorFunction constructor, the best we can
	        // do is to check its .name property.
	        (ctor.displayName || ctor.name) === "GeneratorFunction"
	      : false;
	  };

	  runtime.mark = function(genFun) {
	    if (Object.setPrototypeOf) {
	      Object.setPrototypeOf(genFun, GeneratorFunctionPrototype);
	    } else {
	      genFun.__proto__ = GeneratorFunctionPrototype;
	      if (!(toStringTagSymbol in genFun)) {
	        genFun[toStringTagSymbol] = "GeneratorFunction";
	      }
	    }
	    genFun.prototype = Object.create(Gp);
	    return genFun;
	  };

	  // Within the body of any async function, `await x` is transformed to
	  // `yield regeneratorRuntime.awrap(x)`, so that the runtime can test
	  // `hasOwn.call(value, "__await")` to determine if the yielded value is
	  // meant to be awaited.
	  runtime.awrap = function(arg) {
	    return { __await: arg };
	  };

	  function AsyncIterator(generator) {
	    function invoke(method, arg, resolve, reject) {
	      var record = tryCatch(generator[method], generator, arg);
	      if (record.type === "throw") {
	        reject(record.arg);
	      } else {
	        var result = record.arg;
	        var value = result.value;
	        if (value &&
	            typeof value === "object" &&
	            hasOwn.call(value, "__await")) {
	          return Promise.resolve(value.__await).then(function(value) {
	            invoke("next", value, resolve, reject);
	          }, function(err) {
	            invoke("throw", err, resolve, reject);
	          });
	        }

	        return Promise.resolve(value).then(function(unwrapped) {
	          // When a yielded Promise is resolved, its final value becomes
	          // the .value of the Promise<{value,done}> result for the
	          // current iteration. If the Promise is rejected, however, the
	          // result for this iteration will be rejected with the same
	          // reason. Note that rejections of yielded Promises are not
	          // thrown back into the generator function, as is the case
	          // when an awaited Promise is rejected. This difference in
	          // behavior between yield and await is important, because it
	          // allows the consumer to decide what to do with the yielded
	          // rejection (swallow it and continue, manually .throw it back
	          // into the generator, abandon iteration, whatever). With
	          // await, by contrast, there is no opportunity to examine the
	          // rejection reason outside the generator function, so the
	          // only option is to throw it from the await expression, and
	          // let the generator function handle the exception.
	          result.value = unwrapped;
	          resolve(result);
	        }, reject);
	      }
	    }

	    var previousPromise;

	    function enqueue(method, arg) {
	      function callInvokeWithMethodAndArg() {
	        return new Promise(function(resolve, reject) {
	          invoke(method, arg, resolve, reject);
	        });
	      }

	      return previousPromise =
	        // If enqueue has been called before, then we want to wait until
	        // all previous Promises have been resolved before calling invoke,
	        // so that results are always delivered in the correct order. If
	        // enqueue has not been called before, then it is important to
	        // call invoke immediately, without waiting on a callback to fire,
	        // so that the async generator function has the opportunity to do
	        // any necessary setup in a predictable way. This predictability
	        // is why the Promise constructor synchronously invokes its
	        // executor callback, and why async functions synchronously
	        // execute code before the first await. Since we implement simple
	        // async functions in terms of async generators, it is especially
	        // important to get this right, even though it requires care.
	        previousPromise ? previousPromise.then(
	          callInvokeWithMethodAndArg,
	          // Avoid propagating failures to Promises returned by later
	          // invocations of the iterator.
	          callInvokeWithMethodAndArg
	        ) : callInvokeWithMethodAndArg();
	    }

	    // Define the unified helper method that is used to implement .next,
	    // .throw, and .return (see defineIteratorMethods).
	    this._invoke = enqueue;
	  }

	  defineIteratorMethods(AsyncIterator.prototype);
	  AsyncIterator.prototype[asyncIteratorSymbol] = function () {
	    return this;
	  };
	  runtime.AsyncIterator = AsyncIterator;

	  // Note that simple async functions are implemented on top of
	  // AsyncIterator objects; they just return a Promise for the value of
	  // the final result produced by the iterator.
	  runtime.async = function(innerFn, outerFn, self, tryLocsList) {
	    var iter = new AsyncIterator(
	      wrap(innerFn, outerFn, self, tryLocsList)
	    );

	    return runtime.isGeneratorFunction(outerFn)
	      ? iter // If outerFn is a generator, return the full iterator.
	      : iter.next().then(function(result) {
	          return result.done ? result.value : iter.next();
	        });
	  };

	  function makeInvokeMethod(innerFn, self, context) {
	    var state = GenStateSuspendedStart;

	    return function invoke(method, arg) {
	      if (state === GenStateExecuting) {
	        throw new Error("Generator is already running");
	      }

	      if (state === GenStateCompleted) {
	        if (method === "throw") {
	          throw arg;
	        }

	        // Be forgiving, per 25.3.3.3.3 of the spec:
	        // https://people.mozilla.org/~jorendorff/es6-draft.html#sec-generatorresume
	        return doneResult();
	      }

	      context.method = method;
	      context.arg = arg;

	      while (true) {
	        var delegate = context.delegate;
	        if (delegate) {
	          var delegateResult = maybeInvokeDelegate(delegate, context);
	          if (delegateResult) {
	            if (delegateResult === ContinueSentinel) continue;
	            return delegateResult;
	          }
	        }

	        if (context.method === "next") {
	          // Setting context._sent for legacy support of Babel's
	          // function.sent implementation.
	          context.sent = context._sent = context.arg;

	        } else if (context.method === "throw") {
	          if (state === GenStateSuspendedStart) {
	            state = GenStateCompleted;
	            throw context.arg;
	          }

	          context.dispatchException(context.arg);

	        } else if (context.method === "return") {
	          context.abrupt("return", context.arg);
	        }

	        state = GenStateExecuting;

	        var record = tryCatch(innerFn, self, context);
	        if (record.type === "normal") {
	          // If an exception is thrown from innerFn, we leave state ===
	          // GenStateExecuting and loop back for another invocation.
	          state = context.done
	            ? GenStateCompleted
	            : GenStateSuspendedYield;

	          if (record.arg === ContinueSentinel) {
	            continue;
	          }

	          return {
	            value: record.arg,
	            done: context.done
	          };

	        } else if (record.type === "throw") {
	          state = GenStateCompleted;
	          // Dispatch the exception by looping back around to the
	          // context.dispatchException(context.arg) call above.
	          context.method = "throw";
	          context.arg = record.arg;
	        }
	      }
	    };
	  }

	  // Call delegate.iterator[context.method](context.arg) and handle the
	  // result, either by returning a { value, done } result from the
	  // delegate iterator, or by modifying context.method and context.arg,
	  // setting context.delegate to null, and returning the ContinueSentinel.
	  function maybeInvokeDelegate(delegate, context) {
	    var method = delegate.iterator[context.method];
	    if (method === undefined) {
	      // A .throw or .return when the delegate iterator has no .throw
	      // method always terminates the yield* loop.
	      context.delegate = null;

	      if (context.method === "throw") {
	        if (delegate.iterator.return) {
	          // If the delegate iterator has a return method, give it a
	          // chance to clean up.
	          context.method = "return";
	          context.arg = undefined;
	          maybeInvokeDelegate(delegate, context);

	          if (context.method === "throw") {
	            // If maybeInvokeDelegate(context) changed context.method from
	            // "return" to "throw", let that override the TypeError below.
	            return ContinueSentinel;
	          }
	        }

	        context.method = "throw";
	        context.arg = new TypeError(
	          "The iterator does not provide a 'throw' method");
	      }

	      return ContinueSentinel;
	    }

	    var record = tryCatch(method, delegate.iterator, context.arg);

	    if (record.type === "throw") {
	      context.method = "throw";
	      context.arg = record.arg;
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    var info = record.arg;

	    if (! info) {
	      context.method = "throw";
	      context.arg = new TypeError("iterator result is not an object");
	      context.delegate = null;
	      return ContinueSentinel;
	    }

	    if (info.done) {
	      // Assign the result of the finished delegate to the temporary
	      // variable specified by delegate.resultName (see delegateYield).
	      context[delegate.resultName] = info.value;

	      // Resume execution at the desired location (see delegateYield).
	      context.next = delegate.nextLoc;

	      // If context.method was "throw" but the delegate handled the
	      // exception, let the outer generator proceed normally. If
	      // context.method was "next", forget context.arg since it has been
	      // "consumed" by the delegate iterator. If context.method was
	      // "return", allow the original .return call to continue in the
	      // outer generator.
	      if (context.method !== "return") {
	        context.method = "next";
	        context.arg = undefined;
	      }

	    } else {
	      // Re-yield the result returned by the delegate method.
	      return info;
	    }

	    // The delegate iterator is finished, so forget it and continue with
	    // the outer generator.
	    context.delegate = null;
	    return ContinueSentinel;
	  }

	  // Define Generator.prototype.{next,throw,return} in terms of the
	  // unified ._invoke helper method.
	  defineIteratorMethods(Gp);

	  Gp[toStringTagSymbol] = "Generator";

	  // A Generator should always return itself as the iterator object when the
	  // @@iterator function is called on it. Some browsers' implementations of the
	  // iterator prototype chain incorrectly implement this, causing the Generator
	  // object to not be returned from this call. This ensures that doesn't happen.
	  // See https://github.com/facebook/regenerator/issues/274 for more details.
	  Gp[iteratorSymbol] = function() {
	    return this;
	  };

	  Gp.toString = function() {
	    return "[object Generator]";
	  };

	  function pushTryEntry(locs) {
	    var entry = { tryLoc: locs[0] };

	    if (1 in locs) {
	      entry.catchLoc = locs[1];
	    }

	    if (2 in locs) {
	      entry.finallyLoc = locs[2];
	      entry.afterLoc = locs[3];
	    }

	    this.tryEntries.push(entry);
	  }

	  function resetTryEntry(entry) {
	    var record = entry.completion || {};
	    record.type = "normal";
	    delete record.arg;
	    entry.completion = record;
	  }

	  function Context(tryLocsList) {
	    // The root entry object (effectively a try statement without a catch
	    // or a finally block) gives us a place to store values thrown from
	    // locations where there is no enclosing try statement.
	    this.tryEntries = [{ tryLoc: "root" }];
	    tryLocsList.forEach(pushTryEntry, this);
	    this.reset(true);
	  }

	  runtime.keys = function(object) {
	    var keys = [];
	    for (var key in object) {
	      keys.push(key);
	    }
	    keys.reverse();

	    // Rather than returning an object with a next method, we keep
	    // things simple and return the next function itself.
	    return function next() {
	      while (keys.length) {
	        var key = keys.pop();
	        if (key in object) {
	          next.value = key;
	          next.done = false;
	          return next;
	        }
	      }

	      // To avoid creating an additional object, we just hang the .value
	      // and .done properties off the next function object itself. This
	      // also ensures that the minifier will not anonymize the function.
	      next.done = true;
	      return next;
	    };
	  };

	  function values(iterable) {
	    if (iterable) {
	      var iteratorMethod = iterable[iteratorSymbol];
	      if (iteratorMethod) {
	        return iteratorMethod.call(iterable);
	      }

	      if (typeof iterable.next === "function") {
	        return iterable;
	      }

	      if (!isNaN(iterable.length)) {
	        var i = -1, next = function next() {
	          while (++i < iterable.length) {
	            if (hasOwn.call(iterable, i)) {
	              next.value = iterable[i];
	              next.done = false;
	              return next;
	            }
	          }

	          next.value = undefined;
	          next.done = true;

	          return next;
	        };

	        return next.next = next;
	      }
	    }

	    // Return an iterator with no values.
	    return { next: doneResult };
	  }
	  runtime.values = values;

	  function doneResult() {
	    return { value: undefined, done: true };
	  }

	  Context.prototype = {
	    constructor: Context,

	    reset: function(skipTempReset) {
	      this.prev = 0;
	      this.next = 0;
	      // Resetting context._sent for legacy support of Babel's
	      // function.sent implementation.
	      this.sent = this._sent = undefined;
	      this.done = false;
	      this.delegate = null;

	      this.method = "next";
	      this.arg = undefined;

	      this.tryEntries.forEach(resetTryEntry);

	      if (!skipTempReset) {
	        for (var name in this) {
	          // Not sure about the optimal order of these conditions:
	          if (name.charAt(0) === "t" &&
	              hasOwn.call(this, name) &&
	              !isNaN(+name.slice(1))) {
	            this[name] = undefined;
	          }
	        }
	      }
	    },

	    stop: function() {
	      this.done = true;

	      var rootEntry = this.tryEntries[0];
	      var rootRecord = rootEntry.completion;
	      if (rootRecord.type === "throw") {
	        throw rootRecord.arg;
	      }

	      return this.rval;
	    },

	    dispatchException: function(exception) {
	      if (this.done) {
	        throw exception;
	      }

	      var context = this;
	      function handle(loc, caught) {
	        record.type = "throw";
	        record.arg = exception;
	        context.next = loc;

	        if (caught) {
	          // If the dispatched exception was caught by a catch block,
	          // then let that catch block handle the exception normally.
	          context.method = "next";
	          context.arg = undefined;
	        }

	        return !! caught;
	      }

	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        var record = entry.completion;

	        if (entry.tryLoc === "root") {
	          // Exception thrown outside of any try block that could handle
	          // it, so set the completion value of the entire function to
	          // throw the exception.
	          return handle("end");
	        }

	        if (entry.tryLoc <= this.prev) {
	          var hasCatch = hasOwn.call(entry, "catchLoc");
	          var hasFinally = hasOwn.call(entry, "finallyLoc");

	          if (hasCatch && hasFinally) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            } else if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else if (hasCatch) {
	            if (this.prev < entry.catchLoc) {
	              return handle(entry.catchLoc, true);
	            }

	          } else if (hasFinally) {
	            if (this.prev < entry.finallyLoc) {
	              return handle(entry.finallyLoc);
	            }

	          } else {
	            throw new Error("try statement without catch or finally");
	          }
	        }
	      }
	    },

	    abrupt: function(type, arg) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc <= this.prev &&
	            hasOwn.call(entry, "finallyLoc") &&
	            this.prev < entry.finallyLoc) {
	          var finallyEntry = entry;
	          break;
	        }
	      }

	      if (finallyEntry &&
	          (type === "break" ||
	           type === "continue") &&
	          finallyEntry.tryLoc <= arg &&
	          arg <= finallyEntry.finallyLoc) {
	        // Ignore the finally entry if control is not jumping to a
	        // location outside the try/catch block.
	        finallyEntry = null;
	      }

	      var record = finallyEntry ? finallyEntry.completion : {};
	      record.type = type;
	      record.arg = arg;

	      if (finallyEntry) {
	        this.method = "next";
	        this.next = finallyEntry.finallyLoc;
	        return ContinueSentinel;
	      }

	      return this.complete(record);
	    },

	    complete: function(record, afterLoc) {
	      if (record.type === "throw") {
	        throw record.arg;
	      }

	      if (record.type === "break" ||
	          record.type === "continue") {
	        this.next = record.arg;
	      } else if (record.type === "return") {
	        this.rval = this.arg = record.arg;
	        this.method = "return";
	        this.next = "end";
	      } else if (record.type === "normal" && afterLoc) {
	        this.next = afterLoc;
	      }

	      return ContinueSentinel;
	    },

	    finish: function(finallyLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.finallyLoc === finallyLoc) {
	          this.complete(entry.completion, entry.afterLoc);
	          resetTryEntry(entry);
	          return ContinueSentinel;
	        }
	      }
	    },

	    "catch": function(tryLoc) {
	      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
	        var entry = this.tryEntries[i];
	        if (entry.tryLoc === tryLoc) {
	          var record = entry.completion;
	          if (record.type === "throw") {
	            var thrown = record.arg;
	            resetTryEntry(entry);
	          }
	          return thrown;
	        }
	      }

	      // The context.catch method must only be called with a location
	      // argument that corresponds to a known catch block.
	      throw new Error("illegal catch attempt");
	    },

	    delegateYield: function(iterable, resultName, nextLoc) {
	      this.delegate = {
	        iterator: values(iterable),
	        resultName: resultName,
	        nextLoc: nextLoc
	      };

	      if (this.method === "next") {
	        // Deliberately forget the last sent value so that we don't
	        // accidentally pass it on to the delegate.
	        this.arg = undefined;
	      }

	      return ContinueSentinel;
	    }
	  };
	})(
	  // In sloppy mode, unbound `this` refers to the global object, fallback to
	  // Function constructor if we're in global strict mode. That is sadly a form
	  // of indirect eval which violates Content Security Policy.
	  (function() { return this })() || Function("return this")()
	);
	});

	/**
	 * Copyright (c) 2014-present, Facebook, Inc.
	 *
	 * This source code is licensed under the MIT license found in the
	 * LICENSE file in the root directory of this source tree.
	 */

	// This method of obtaining a reference to the global object needs to be
	// kept identical to the way it is obtained in runtime.js
	var g = (function() { return this })() || Function("return this")();

	// Use `getOwnPropertyNames` because not all browsers support calling
	// `hasOwnProperty` on the global `self` object in a worker. See #183.
	var hadRuntime = g.regeneratorRuntime &&
	  Object.getOwnPropertyNames(g).indexOf("regeneratorRuntime") >= 0;

	// Save the old regeneratorRuntime in case it needs to be restored later.
	var oldRuntime = hadRuntime && g.regeneratorRuntime;

	// Force reevalutation of runtime.js.
	g.regeneratorRuntime = undefined;

	var runtimeModule = runtime;

	if (hadRuntime) {
	  // Restore the original runtime.
	  g.regeneratorRuntime = oldRuntime;
	} else {
	  // Remove the global property added by runtime.js.
	  try {
	    delete g.regeneratorRuntime;
	  } catch(e) {
	    g.regeneratorRuntime = undefined;
	  }
	}

	var regenerator = runtimeModule;

	var possibleConstructorReturn = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _typeof3 = _interopRequireDefault(_typeof_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (self, call) {
	  if (!self) {
	    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
	  }

	  return call && ((typeof call === "undefined" ? "undefined" : (0, _typeof3.default)(call)) === "object" || typeof call === "function") ? call : self;
	};
	});

	var _possibleConstructorReturn = unwrapExports(possibleConstructorReturn);

	// Works with __proto__ only. Old v8 can't work with null proto objects.
	/* eslint-disable no-proto */


	var check = function (O, proto) {
	  _anObject(O);
	  if (!_isObject(proto) && proto !== null) throw TypeError(proto + ": can't set as prototype!");
	};
	var _setProto = {
	  set: Object.setPrototypeOf || ('__proto__' in {} ? // eslint-disable-line
	    function (test, buggy, set) {
	      try {
	        set = _ctx(Function.call, _objectGopd.f(Object.prototype, '__proto__').set, 2);
	        set(test, []);
	        buggy = !(test instanceof Array);
	      } catch (e) { buggy = true; }
	      return function setPrototypeOf(O, proto) {
	        check(O, proto);
	        if (buggy) O.__proto__ = proto;
	        else set(O, proto);
	        return O;
	      };
	    }({}, false) : undefined),
	  check: check
	};

	// 19.1.3.19 Object.setPrototypeOf(O, proto)

	_export(_export.S, 'Object', { setPrototypeOf: _setProto.set });

	var setPrototypeOf = _core.Object.setPrototypeOf;

	var setPrototypeOf$1 = createCommonjsModule(function (module) {
	module.exports = { "default": setPrototypeOf, __esModule: true };
	});

	unwrapExports(setPrototypeOf$1);

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	_export(_export.S, 'Object', { create: _objectCreate });

	var $Object = _core.Object;
	var create = function create(P, D) {
	  return $Object.create(P, D);
	};

	var create$1 = createCommonjsModule(function (module) {
	module.exports = { "default": create, __esModule: true };
	});

	unwrapExports(create$1);

	var inherits = createCommonjsModule(function (module, exports) {

	exports.__esModule = true;



	var _setPrototypeOf2 = _interopRequireDefault(setPrototypeOf$1);



	var _create2 = _interopRequireDefault(create$1);



	var _typeof3 = _interopRequireDefault(_typeof_1);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function (subClass, superClass) {
	  if (typeof superClass !== "function" && superClass !== null) {
	    throw new TypeError("Super expression must either be null or a function, not " + (typeof superClass === "undefined" ? "undefined" : (0, _typeof3.default)(superClass)));
	  }

	  subClass.prototype = (0, _create2.default)(superClass && superClass.prototype, {
	    constructor: {
	      value: subClass,
	      enumerable: false,
	      writable: true,
	      configurable: true
	    }
	  });
	  if (superClass) _setPrototypeOf2.default ? (0, _setPrototypeOf2.default)(subClass, superClass) : subClass.__proto__ = superClass;
	};
	});

	var _inherits = unwrapExports(inherits);

	var global$1 = (typeof global !== "undefined" ? global :
	            typeof self !== "undefined" ? self :
	            typeof window !== "undefined" ? window : {});

	var isEnum$1 = _objectPie.f;
	var _objectToArray = function (isEntries) {
	  return function (it) {
	    var O = _toIobject(it);
	    var keys = _objectKeys(O);
	    var length = keys.length;
	    var i = 0;
	    var result = [];
	    var key;
	    while (length > i) {
	      key = keys[i++];
	      if (!_descriptors || isEnum$1.call(O, key)) {
	        result.push(isEntries ? [key, O[key]] : O[key]);
	      }
	    }
	    return result;
	  };
	};

	// https://github.com/tc39/proposal-object-values-entries

	var $values = _objectToArray(false);

	_export(_export.S, 'Object', {
	  values: function values(it) {
	    return $values(it);
	  }
	});

	var values = _core.Object.values;

	var values$1 = createCommonjsModule(function (module) {
	module.exports = { "default": values, __esModule: true };
	});

	var _Object$values = unwrapExports(values$1);

	var inherits_browser = createCommonjsModule(function (module) {
	if (typeof Object.create === 'function') {
	  // implementation from standard node.js 'util' module
	  module.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      ctor.prototype = Object.create(superCtor.prototype, {
	        constructor: {
	          value: ctor,
	          enumerable: false,
	          writable: true,
	          configurable: true
	        }
	      });
	    }
	  };
	} else {
	  // old school shim for old browsers
	  module.exports = function inherits(ctor, superCtor) {
	    if (superCtor) {
	      ctor.super_ = superCtor;
	      var TempCtor = function () {};
	      TempCtor.prototype = superCtor.prototype;
	      ctor.prototype = new TempCtor();
	      ctor.prototype.constructor = ctor;
	    }
	  };
	}
	});

	var lookup = [];
	var revLookup = [];
	var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array;
	var inited = false;
	function init () {
	  inited = true;
	  var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
	  for (var i = 0, len = code.length; i < len; ++i) {
	    lookup[i] = code[i];
	    revLookup[code.charCodeAt(i)] = i;
	  }

	  revLookup['-'.charCodeAt(0)] = 62;
	  revLookup['_'.charCodeAt(0)] = 63;
	}

	function toByteArray (b64) {
	  if (!inited) {
	    init();
	  }
	  var i, j, l, tmp, placeHolders, arr;
	  var len = b64.length;

	  if (len % 4 > 0) {
	    throw new Error('Invalid string. Length must be a multiple of 4')
	  }

	  // the number of equal signs (place holders)
	  // if there are two placeholders, than the two characters before it
	  // represent one byte
	  // if there is only one, then the three characters before it represent 2 bytes
	  // this is just a cheap hack to not do indexOf twice
	  placeHolders = b64[len - 2] === '=' ? 2 : b64[len - 1] === '=' ? 1 : 0;

	  // base64 is 4/3 + up to two characters of the original data
	  arr = new Arr(len * 3 / 4 - placeHolders);

	  // if there are placeholders, only get up to the last complete 4 chars
	  l = placeHolders > 0 ? len - 4 : len;

	  var L = 0;

	  for (i = 0, j = 0; i < l; i += 4, j += 3) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 18) | (revLookup[b64.charCodeAt(i + 1)] << 12) | (revLookup[b64.charCodeAt(i + 2)] << 6) | revLookup[b64.charCodeAt(i + 3)];
	    arr[L++] = (tmp >> 16) & 0xFF;
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  if (placeHolders === 2) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 2) | (revLookup[b64.charCodeAt(i + 1)] >> 4);
	    arr[L++] = tmp & 0xFF;
	  } else if (placeHolders === 1) {
	    tmp = (revLookup[b64.charCodeAt(i)] << 10) | (revLookup[b64.charCodeAt(i + 1)] << 4) | (revLookup[b64.charCodeAt(i + 2)] >> 2);
	    arr[L++] = (tmp >> 8) & 0xFF;
	    arr[L++] = tmp & 0xFF;
	  }

	  return arr
	}

	function tripletToBase64 (num) {
	  return lookup[num >> 18 & 0x3F] + lookup[num >> 12 & 0x3F] + lookup[num >> 6 & 0x3F] + lookup[num & 0x3F]
	}

	function encodeChunk (uint8, start, end) {
	  var tmp;
	  var output = [];
	  for (var i = start; i < end; i += 3) {
	    tmp = (uint8[i] << 16) + (uint8[i + 1] << 8) + (uint8[i + 2]);
	    output.push(tripletToBase64(tmp));
	  }
	  return output.join('')
	}

	function fromByteArray (uint8) {
	  if (!inited) {
	    init();
	  }
	  var tmp;
	  var len = uint8.length;
	  var extraBytes = len % 3; // if we have 1 byte left, pad 2 bytes
	  var output = '';
	  var parts = [];
	  var maxChunkLength = 16383; // must be multiple of 3

	  // go through the array every three bytes, we'll deal with trailing stuff later
	  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
	    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)));
	  }

	  // pad the end with zeros, but make sure to not forget the extra bytes
	  if (extraBytes === 1) {
	    tmp = uint8[len - 1];
	    output += lookup[tmp >> 2];
	    output += lookup[(tmp << 4) & 0x3F];
	    output += '==';
	  } else if (extraBytes === 2) {
	    tmp = (uint8[len - 2] << 8) + (uint8[len - 1]);
	    output += lookup[tmp >> 10];
	    output += lookup[(tmp >> 4) & 0x3F];
	    output += lookup[(tmp << 2) & 0x3F];
	    output += '=';
	  }

	  parts.push(output);

	  return parts.join('')
	}

	function read (buffer, offset, isLE, mLen, nBytes) {
	  var e, m;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var nBits = -7;
	  var i = isLE ? (nBytes - 1) : 0;
	  var d = isLE ? -1 : 1;
	  var s = buffer[offset + i];

	  i += d;

	  e = s & ((1 << (-nBits)) - 1);
	  s >>= (-nBits);
	  nBits += eLen;
	  for (; nBits > 0; e = e * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  m = e & ((1 << (-nBits)) - 1);
	  e >>= (-nBits);
	  nBits += mLen;
	  for (; nBits > 0; m = m * 256 + buffer[offset + i], i += d, nBits -= 8) {}

	  if (e === 0) {
	    e = 1 - eBias;
	  } else if (e === eMax) {
	    return m ? NaN : ((s ? -1 : 1) * Infinity)
	  } else {
	    m = m + Math.pow(2, mLen);
	    e = e - eBias;
	  }
	  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
	}

	function write (buffer, value, offset, isLE, mLen, nBytes) {
	  var e, m, c;
	  var eLen = nBytes * 8 - mLen - 1;
	  var eMax = (1 << eLen) - 1;
	  var eBias = eMax >> 1;
	  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0);
	  var i = isLE ? 0 : (nBytes - 1);
	  var d = isLE ? 1 : -1;
	  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0;

	  value = Math.abs(value);

	  if (isNaN(value) || value === Infinity) {
	    m = isNaN(value) ? 1 : 0;
	    e = eMax;
	  } else {
	    e = Math.floor(Math.log(value) / Math.LN2);
	    if (value * (c = Math.pow(2, -e)) < 1) {
	      e--;
	      c *= 2;
	    }
	    if (e + eBias >= 1) {
	      value += rt / c;
	    } else {
	      value += rt * Math.pow(2, 1 - eBias);
	    }
	    if (value * c >= 2) {
	      e++;
	      c /= 2;
	    }

	    if (e + eBias >= eMax) {
	      m = 0;
	      e = eMax;
	    } else if (e + eBias >= 1) {
	      m = (value * c - 1) * Math.pow(2, mLen);
	      e = e + eBias;
	    } else {
	      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen);
	      e = 0;
	    }
	  }

	  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

	  e = (e << mLen) | m;
	  eLen += mLen;
	  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

	  buffer[offset + i - d] |= s * 128;
	}

	var toString$2 = {}.toString;

	var isArray = Array.isArray || function (arr) {
	  return toString$2.call(arr) == '[object Array]';
	};

	var INSPECT_MAX_BYTES = 50;

	/**
	 * If `Buffer.TYPED_ARRAY_SUPPORT`:
	 *   === true    Use Uint8Array implementation (fastest)
	 *   === false   Use Object implementation (most compatible, even IE6)
	 *
	 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
	 * Opera 11.6+, iOS 4.2+.
	 *
	 * Due to various browser bugs, sometimes the Object implementation will be used even
	 * when the browser supports typed arrays.
	 *
	 * Note:
	 *
	 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
	 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
	 *
	 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
	 *
	 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
	 *     incorrect length in some situations.

	 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
	 * get the Object implementation, which is slower but behaves correctly.
	 */
	Buffer.TYPED_ARRAY_SUPPORT = global$1.TYPED_ARRAY_SUPPORT !== undefined
	  ? global$1.TYPED_ARRAY_SUPPORT
	  : true;

	/*
	 * Export kMaxLength after typed array support is determined.
	 */
	var _kMaxLength = kMaxLength();

	function kMaxLength () {
	  return Buffer.TYPED_ARRAY_SUPPORT
	    ? 0x7fffffff
	    : 0x3fffffff
	}

	function createBuffer (that, length) {
	  if (kMaxLength() < length) {
	    throw new RangeError('Invalid typed array length')
	  }
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = new Uint8Array(length);
	    that.__proto__ = Buffer.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    if (that === null) {
	      that = new Buffer(length);
	    }
	    that.length = length;
	  }

	  return that
	}

	/**
	 * The Buffer constructor returns instances of `Uint8Array` that have their
	 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
	 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
	 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
	 * returns a single octet.
	 *
	 * The `Uint8Array` prototype remains unmodified.
	 */

	function Buffer (arg, encodingOrOffset, length) {
	  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
	    return new Buffer(arg, encodingOrOffset, length)
	  }

	  // Common case.
	  if (typeof arg === 'number') {
	    if (typeof encodingOrOffset === 'string') {
	      throw new Error(
	        'If encoding is specified then the first argument must be a string'
	      )
	    }
	    return allocUnsafe(this, arg)
	  }
	  return from(this, arg, encodingOrOffset, length)
	}

	Buffer.poolSize = 8192; // not used by this implementation

	// TODO: Legacy, not needed anymore. Remove in next major version.
	Buffer._augment = function (arr) {
	  arr.__proto__ = Buffer.prototype;
	  return arr
	};

	function from (that, value, encodingOrOffset, length) {
	  if (typeof value === 'number') {
	    throw new TypeError('"value" argument must not be a number')
	  }

	  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
	    return fromArrayBuffer(that, value, encodingOrOffset, length)
	  }

	  if (typeof value === 'string') {
	    return fromString(that, value, encodingOrOffset)
	  }

	  return fromObject(that, value)
	}

	/**
	 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
	 * if value is a number.
	 * Buffer.from(str[, encoding])
	 * Buffer.from(array)
	 * Buffer.from(buffer)
	 * Buffer.from(arrayBuffer[, byteOffset[, length]])
	 **/
	Buffer.from = function (value, encodingOrOffset, length) {
	  return from(null, value, encodingOrOffset, length)
	};

	if (Buffer.TYPED_ARRAY_SUPPORT) {
	  Buffer.prototype.__proto__ = Uint8Array.prototype;
	  Buffer.__proto__ = Uint8Array;
	}

	function assertSize (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('"size" argument must be a number')
	  } else if (size < 0) {
	    throw new RangeError('"size" argument must not be negative')
	  }
	}

	function alloc (that, size, fill, encoding) {
	  assertSize(size);
	  if (size <= 0) {
	    return createBuffer(that, size)
	  }
	  if (fill !== undefined) {
	    // Only pay attention to encoding if it's a string. This
	    // prevents accidentally sending in a number that would
	    // be interpretted as a start offset.
	    return typeof encoding === 'string'
	      ? createBuffer(that, size).fill(fill, encoding)
	      : createBuffer(that, size).fill(fill)
	  }
	  return createBuffer(that, size)
	}

	/**
	 * Creates a new filled Buffer instance.
	 * alloc(size[, fill[, encoding]])
	 **/
	Buffer.alloc = function (size, fill, encoding) {
	  return alloc(null, size, fill, encoding)
	};

	function allocUnsafe (that, size) {
	  assertSize(size);
	  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) {
	    for (var i = 0; i < size; ++i) {
	      that[i] = 0;
	    }
	  }
	  return that
	}

	/**
	 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
	 * */
	Buffer.allocUnsafe = function (size) {
	  return allocUnsafe(null, size)
	};
	/**
	 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
	 */
	Buffer.allocUnsafeSlow = function (size) {
	  return allocUnsafe(null, size)
	};

	function fromString (that, string, encoding) {
	  if (typeof encoding !== 'string' || encoding === '') {
	    encoding = 'utf8';
	  }

	  if (!Buffer.isEncoding(encoding)) {
	    throw new TypeError('"encoding" must be a valid string encoding')
	  }

	  var length = byteLength(string, encoding) | 0;
	  that = createBuffer(that, length);

	  var actual = that.write(string, encoding);

	  if (actual !== length) {
	    // Writing a hex string, for example, that contains invalid characters will
	    // cause everything after the first invalid character to be ignored. (e.g.
	    // 'abxxcd' will be treated as 'ab')
	    that = that.slice(0, actual);
	  }

	  return that
	}

	function fromArrayLike (that, array) {
	  var length = array.length < 0 ? 0 : checked(array.length) | 0;
	  that = createBuffer(that, length);
	  for (var i = 0; i < length; i += 1) {
	    that[i] = array[i] & 255;
	  }
	  return that
	}

	function fromArrayBuffer (that, array, byteOffset, length) {
	  array.byteLength; // this throws if `array` is not a valid ArrayBuffer

	  if (byteOffset < 0 || array.byteLength < byteOffset) {
	    throw new RangeError('\'offset\' is out of bounds')
	  }

	  if (array.byteLength < byteOffset + (length || 0)) {
	    throw new RangeError('\'length\' is out of bounds')
	  }

	  if (byteOffset === undefined && length === undefined) {
	    array = new Uint8Array(array);
	  } else if (length === undefined) {
	    array = new Uint8Array(array, byteOffset);
	  } else {
	    array = new Uint8Array(array, byteOffset, length);
	  }

	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    // Return an augmented `Uint8Array` instance, for best performance
	    that = array;
	    that.__proto__ = Buffer.prototype;
	  } else {
	    // Fallback: Return an object instance of the Buffer class
	    that = fromArrayLike(that, array);
	  }
	  return that
	}

	function fromObject (that, obj) {
	  if (internalIsBuffer(obj)) {
	    var len = checked(obj.length) | 0;
	    that = createBuffer(that, len);

	    if (that.length === 0) {
	      return that
	    }

	    obj.copy(that, 0, 0, len);
	    return that
	  }

	  if (obj) {
	    if ((typeof ArrayBuffer !== 'undefined' &&
	        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
	      if (typeof obj.length !== 'number' || isnan(obj.length)) {
	        return createBuffer(that, 0)
	      }
	      return fromArrayLike(that, obj)
	    }

	    if (obj.type === 'Buffer' && isArray(obj.data)) {
	      return fromArrayLike(that, obj.data)
	    }
	  }

	  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
	}

	function checked (length) {
	  // Note: cannot use `length < kMaxLength()` here because that fails when
	  // length is NaN (which is otherwise coerced to zero.)
	  if (length >= kMaxLength()) {
	    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
	                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
	  }
	  return length | 0
	}

	function SlowBuffer (length) {
	  if (+length != length) { // eslint-disable-line eqeqeq
	    length = 0;
	  }
	  return Buffer.alloc(+length)
	}
	Buffer.isBuffer = isBuffer;
	function internalIsBuffer (b) {
	  return !!(b != null && b._isBuffer)
	}

	Buffer.compare = function compare (a, b) {
	  if (!internalIsBuffer(a) || !internalIsBuffer(b)) {
	    throw new TypeError('Arguments must be Buffers')
	  }

	  if (a === b) return 0

	  var x = a.length;
	  var y = b.length;

	  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
	    if (a[i] !== b[i]) {
	      x = a[i];
	      y = b[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	Buffer.isEncoding = function isEncoding (encoding) {
	  switch (String(encoding).toLowerCase()) {
	    case 'hex':
	    case 'utf8':
	    case 'utf-8':
	    case 'ascii':
	    case 'latin1':
	    case 'binary':
	    case 'base64':
	    case 'ucs2':
	    case 'ucs-2':
	    case 'utf16le':
	    case 'utf-16le':
	      return true
	    default:
	      return false
	  }
	};

	Buffer.concat = function concat (list, length) {
	  if (!isArray(list)) {
	    throw new TypeError('"list" argument must be an Array of Buffers')
	  }

	  if (list.length === 0) {
	    return Buffer.alloc(0)
	  }

	  var i;
	  if (length === undefined) {
	    length = 0;
	    for (i = 0; i < list.length; ++i) {
	      length += list[i].length;
	    }
	  }

	  var buffer = Buffer.allocUnsafe(length);
	  var pos = 0;
	  for (i = 0; i < list.length; ++i) {
	    var buf = list[i];
	    if (!internalIsBuffer(buf)) {
	      throw new TypeError('"list" argument must be an Array of Buffers')
	    }
	    buf.copy(buffer, pos);
	    pos += buf.length;
	  }
	  return buffer
	};

	function byteLength (string, encoding) {
	  if (internalIsBuffer(string)) {
	    return string.length
	  }
	  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
	      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
	    return string.byteLength
	  }
	  if (typeof string !== 'string') {
	    string = '' + string;
	  }

	  var len = string.length;
	  if (len === 0) return 0

	  // Use a for loop to avoid recursion
	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'ascii':
	      case 'latin1':
	      case 'binary':
	        return len
	      case 'utf8':
	      case 'utf-8':
	      case undefined:
	        return utf8ToBytes(string).length
	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return len * 2
	      case 'hex':
	        return len >>> 1
	      case 'base64':
	        return base64ToBytes(string).length
	      default:
	        if (loweredCase) return utf8ToBytes(string).length // assume utf8
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	}
	Buffer.byteLength = byteLength;

	function slowToString (encoding, start, end) {
	  var loweredCase = false;

	  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
	  // property of a typed array.

	  // This behaves neither like String nor Uint8Array in that we set start/end
	  // to their upper/lower bounds if the value passed is out of range.
	  // undefined is handled specially as per ECMA-262 6th Edition,
	  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
	  if (start === undefined || start < 0) {
	    start = 0;
	  }
	  // Return early if start > this.length. Done here to prevent potential uint32
	  // coercion fail below.
	  if (start > this.length) {
	    return ''
	  }

	  if (end === undefined || end > this.length) {
	    end = this.length;
	  }

	  if (end <= 0) {
	    return ''
	  }

	  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
	  end >>>= 0;
	  start >>>= 0;

	  if (end <= start) {
	    return ''
	  }

	  if (!encoding) encoding = 'utf8';

	  while (true) {
	    switch (encoding) {
	      case 'hex':
	        return hexSlice(this, start, end)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Slice(this, start, end)

	      case 'ascii':
	        return asciiSlice(this, start, end)

	      case 'latin1':
	      case 'binary':
	        return latin1Slice(this, start, end)

	      case 'base64':
	        return base64Slice(this, start, end)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return utf16leSlice(this, start, end)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = (encoding + '').toLowerCase();
	        loweredCase = true;
	    }
	  }
	}

	// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
	// Buffer instances.
	Buffer.prototype._isBuffer = true;

	function swap (b, n, m) {
	  var i = b[n];
	  b[n] = b[m];
	  b[m] = i;
	}

	Buffer.prototype.swap16 = function swap16 () {
	  var len = this.length;
	  if (len % 2 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 16-bits')
	  }
	  for (var i = 0; i < len; i += 2) {
	    swap(this, i, i + 1);
	  }
	  return this
	};

	Buffer.prototype.swap32 = function swap32 () {
	  var len = this.length;
	  if (len % 4 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 32-bits')
	  }
	  for (var i = 0; i < len; i += 4) {
	    swap(this, i, i + 3);
	    swap(this, i + 1, i + 2);
	  }
	  return this
	};

	Buffer.prototype.swap64 = function swap64 () {
	  var len = this.length;
	  if (len % 8 !== 0) {
	    throw new RangeError('Buffer size must be a multiple of 64-bits')
	  }
	  for (var i = 0; i < len; i += 8) {
	    swap(this, i, i + 7);
	    swap(this, i + 1, i + 6);
	    swap(this, i + 2, i + 5);
	    swap(this, i + 3, i + 4);
	  }
	  return this
	};

	Buffer.prototype.toString = function toString () {
	  var length = this.length | 0;
	  if (length === 0) return ''
	  if (arguments.length === 0) return utf8Slice(this, 0, length)
	  return slowToString.apply(this, arguments)
	};

	Buffer.prototype.equals = function equals (b) {
	  if (!internalIsBuffer(b)) throw new TypeError('Argument must be a Buffer')
	  if (this === b) return true
	  return Buffer.compare(this, b) === 0
	};

	Buffer.prototype.inspect = function inspect () {
	  var str = '';
	  var max = INSPECT_MAX_BYTES;
	  if (this.length > 0) {
	    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ');
	    if (this.length > max) str += ' ... ';
	  }
	  return '<Buffer ' + str + '>'
	};

	Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
	  if (!internalIsBuffer(target)) {
	    throw new TypeError('Argument must be a Buffer')
	  }

	  if (start === undefined) {
	    start = 0;
	  }
	  if (end === undefined) {
	    end = target ? target.length : 0;
	  }
	  if (thisStart === undefined) {
	    thisStart = 0;
	  }
	  if (thisEnd === undefined) {
	    thisEnd = this.length;
	  }

	  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
	    throw new RangeError('out of range index')
	  }

	  if (thisStart >= thisEnd && start >= end) {
	    return 0
	  }
	  if (thisStart >= thisEnd) {
	    return -1
	  }
	  if (start >= end) {
	    return 1
	  }

	  start >>>= 0;
	  end >>>= 0;
	  thisStart >>>= 0;
	  thisEnd >>>= 0;

	  if (this === target) return 0

	  var x = thisEnd - thisStart;
	  var y = end - start;
	  var len = Math.min(x, y);

	  var thisCopy = this.slice(thisStart, thisEnd);
	  var targetCopy = target.slice(start, end);

	  for (var i = 0; i < len; ++i) {
	    if (thisCopy[i] !== targetCopy[i]) {
	      x = thisCopy[i];
	      y = targetCopy[i];
	      break
	    }
	  }

	  if (x < y) return -1
	  if (y < x) return 1
	  return 0
	};

	// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
	// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
	//
	// Arguments:
	// - buffer - a Buffer to search
	// - val - a string, Buffer, or number
	// - byteOffset - an index into `buffer`; will be clamped to an int32
	// - encoding - an optional encoding, relevant is val is a string
	// - dir - true for indexOf, false for lastIndexOf
	function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
	  // Empty buffer means no match
	  if (buffer.length === 0) return -1

	  // Normalize byteOffset
	  if (typeof byteOffset === 'string') {
	    encoding = byteOffset;
	    byteOffset = 0;
	  } else if (byteOffset > 0x7fffffff) {
	    byteOffset = 0x7fffffff;
	  } else if (byteOffset < -0x80000000) {
	    byteOffset = -0x80000000;
	  }
	  byteOffset = +byteOffset;  // Coerce to Number.
	  if (isNaN(byteOffset)) {
	    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
	    byteOffset = dir ? 0 : (buffer.length - 1);
	  }

	  // Normalize byteOffset: negative offsets start from the end of the buffer
	  if (byteOffset < 0) byteOffset = buffer.length + byteOffset;
	  if (byteOffset >= buffer.length) {
	    if (dir) return -1
	    else byteOffset = buffer.length - 1;
	  } else if (byteOffset < 0) {
	    if (dir) byteOffset = 0;
	    else return -1
	  }

	  // Normalize val
	  if (typeof val === 'string') {
	    val = Buffer.from(val, encoding);
	  }

	  // Finally, search either indexOf (if dir is true) or lastIndexOf
	  if (internalIsBuffer(val)) {
	    // Special case: looking for empty string/buffer always fails
	    if (val.length === 0) {
	      return -1
	    }
	    return arrayIndexOf$1(buffer, val, byteOffset, encoding, dir)
	  } else if (typeof val === 'number') {
	    val = val & 0xFF; // Search for a byte value [0-255]
	    if (Buffer.TYPED_ARRAY_SUPPORT &&
	        typeof Uint8Array.prototype.indexOf === 'function') {
	      if (dir) {
	        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
	      } else {
	        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
	      }
	    }
	    return arrayIndexOf$1(buffer, [ val ], byteOffset, encoding, dir)
	  }

	  throw new TypeError('val must be string, number or Buffer')
	}

	function arrayIndexOf$1 (arr, val, byteOffset, encoding, dir) {
	  var indexSize = 1;
	  var arrLength = arr.length;
	  var valLength = val.length;

	  if (encoding !== undefined) {
	    encoding = String(encoding).toLowerCase();
	    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
	        encoding === 'utf16le' || encoding === 'utf-16le') {
	      if (arr.length < 2 || val.length < 2) {
	        return -1
	      }
	      indexSize = 2;
	      arrLength /= 2;
	      valLength /= 2;
	      byteOffset /= 2;
	    }
	  }

	  function read$$1 (buf, i) {
	    if (indexSize === 1) {
	      return buf[i]
	    } else {
	      return buf.readUInt16BE(i * indexSize)
	    }
	  }

	  var i;
	  if (dir) {
	    var foundIndex = -1;
	    for (i = byteOffset; i < arrLength; i++) {
	      if (read$$1(arr, i) === read$$1(val, foundIndex === -1 ? 0 : i - foundIndex)) {
	        if (foundIndex === -1) foundIndex = i;
	        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
	      } else {
	        if (foundIndex !== -1) i -= i - foundIndex;
	        foundIndex = -1;
	      }
	    }
	  } else {
	    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength;
	    for (i = byteOffset; i >= 0; i--) {
	      var found = true;
	      for (var j = 0; j < valLength; j++) {
	        if (read$$1(arr, i + j) !== read$$1(val, j)) {
	          found = false;
	          break
	        }
	      }
	      if (found) return i
	    }
	  }

	  return -1
	}

	Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
	  return this.indexOf(val, byteOffset, encoding) !== -1
	};

	Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
	};

	Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
	  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
	};

	function hexWrite (buf, string, offset, length) {
	  offset = Number(offset) || 0;
	  var remaining = buf.length - offset;
	  if (!length) {
	    length = remaining;
	  } else {
	    length = Number(length);
	    if (length > remaining) {
	      length = remaining;
	    }
	  }

	  // must be an even number of digits
	  var strLen = string.length;
	  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

	  if (length > strLen / 2) {
	    length = strLen / 2;
	  }
	  for (var i = 0; i < length; ++i) {
	    var parsed = parseInt(string.substr(i * 2, 2), 16);
	    if (isNaN(parsed)) return i
	    buf[offset + i] = parsed;
	  }
	  return i
	}

	function utf8Write (buf, string, offset, length) {
	  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
	}

	function asciiWrite (buf, string, offset, length) {
	  return blitBuffer(asciiToBytes(string), buf, offset, length)
	}

	function latin1Write (buf, string, offset, length) {
	  return asciiWrite(buf, string, offset, length)
	}

	function base64Write (buf, string, offset, length) {
	  return blitBuffer(base64ToBytes(string), buf, offset, length)
	}

	function ucs2Write (buf, string, offset, length) {
	  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
	}

	Buffer.prototype.write = function write$$1 (string, offset, length, encoding) {
	  // Buffer#write(string)
	  if (offset === undefined) {
	    encoding = 'utf8';
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, encoding)
	  } else if (length === undefined && typeof offset === 'string') {
	    encoding = offset;
	    length = this.length;
	    offset = 0;
	  // Buffer#write(string, offset[, length][, encoding])
	  } else if (isFinite(offset)) {
	    offset = offset | 0;
	    if (isFinite(length)) {
	      length = length | 0;
	      if (encoding === undefined) encoding = 'utf8';
	    } else {
	      encoding = length;
	      length = undefined;
	    }
	  // legacy write(string, encoding, offset, length) - remove in v0.13
	  } else {
	    throw new Error(
	      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
	    )
	  }

	  var remaining = this.length - offset;
	  if (length === undefined || length > remaining) length = remaining;

	  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
	    throw new RangeError('Attempt to write outside buffer bounds')
	  }

	  if (!encoding) encoding = 'utf8';

	  var loweredCase = false;
	  for (;;) {
	    switch (encoding) {
	      case 'hex':
	        return hexWrite(this, string, offset, length)

	      case 'utf8':
	      case 'utf-8':
	        return utf8Write(this, string, offset, length)

	      case 'ascii':
	        return asciiWrite(this, string, offset, length)

	      case 'latin1':
	      case 'binary':
	        return latin1Write(this, string, offset, length)

	      case 'base64':
	        // Warning: maxLength not taken into account in base64Write
	        return base64Write(this, string, offset, length)

	      case 'ucs2':
	      case 'ucs-2':
	      case 'utf16le':
	      case 'utf-16le':
	        return ucs2Write(this, string, offset, length)

	      default:
	        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
	        encoding = ('' + encoding).toLowerCase();
	        loweredCase = true;
	    }
	  }
	};

	Buffer.prototype.toJSON = function toJSON () {
	  return {
	    type: 'Buffer',
	    data: Array.prototype.slice.call(this._arr || this, 0)
	  }
	};

	function base64Slice (buf, start, end) {
	  if (start === 0 && end === buf.length) {
	    return fromByteArray(buf)
	  } else {
	    return fromByteArray(buf.slice(start, end))
	  }
	}

	function utf8Slice (buf, start, end) {
	  end = Math.min(buf.length, end);
	  var res = [];

	  var i = start;
	  while (i < end) {
	    var firstByte = buf[i];
	    var codePoint = null;
	    var bytesPerSequence = (firstByte > 0xEF) ? 4
	      : (firstByte > 0xDF) ? 3
	      : (firstByte > 0xBF) ? 2
	      : 1;

	    if (i + bytesPerSequence <= end) {
	      var secondByte, thirdByte, fourthByte, tempCodePoint;

	      switch (bytesPerSequence) {
	        case 1:
	          if (firstByte < 0x80) {
	            codePoint = firstByte;
	          }
	          break
	        case 2:
	          secondByte = buf[i + 1];
	          if ((secondByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F);
	            if (tempCodePoint > 0x7F) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 3:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F);
	            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
	              codePoint = tempCodePoint;
	            }
	          }
	          break
	        case 4:
	          secondByte = buf[i + 1];
	          thirdByte = buf[i + 2];
	          fourthByte = buf[i + 3];
	          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
	            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F);
	            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
	              codePoint = tempCodePoint;
	            }
	          }
	      }
	    }

	    if (codePoint === null) {
	      // we did not generate a valid codePoint so insert a
	      // replacement char (U+FFFD) and advance only 1 byte
	      codePoint = 0xFFFD;
	      bytesPerSequence = 1;
	    } else if (codePoint > 0xFFFF) {
	      // encode to utf16 (surrogate pair dance)
	      codePoint -= 0x10000;
	      res.push(codePoint >>> 10 & 0x3FF | 0xD800);
	      codePoint = 0xDC00 | codePoint & 0x3FF;
	    }

	    res.push(codePoint);
	    i += bytesPerSequence;
	  }

	  return decodeCodePointsArray(res)
	}

	// Based on http://stackoverflow.com/a/22747272/680742, the browser with
	// the lowest limit is Chrome, with 0x10000 args.
	// We go 1 magnitude less, for safety
	var MAX_ARGUMENTS_LENGTH = 0x1000;

	function decodeCodePointsArray (codePoints) {
	  var len = codePoints.length;
	  if (len <= MAX_ARGUMENTS_LENGTH) {
	    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
	  }

	  // Decode in chunks to avoid "call stack size exceeded".
	  var res = '';
	  var i = 0;
	  while (i < len) {
	    res += String.fromCharCode.apply(
	      String,
	      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
	    );
	  }
	  return res
	}

	function asciiSlice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i] & 0x7F);
	  }
	  return ret
	}

	function latin1Slice (buf, start, end) {
	  var ret = '';
	  end = Math.min(buf.length, end);

	  for (var i = start; i < end; ++i) {
	    ret += String.fromCharCode(buf[i]);
	  }
	  return ret
	}

	function hexSlice (buf, start, end) {
	  var len = buf.length;

	  if (!start || start < 0) start = 0;
	  if (!end || end < 0 || end > len) end = len;

	  var out = '';
	  for (var i = start; i < end; ++i) {
	    out += toHex(buf[i]);
	  }
	  return out
	}

	function utf16leSlice (buf, start, end) {
	  var bytes = buf.slice(start, end);
	  var res = '';
	  for (var i = 0; i < bytes.length; i += 2) {
	    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256);
	  }
	  return res
	}

	Buffer.prototype.slice = function slice (start, end) {
	  var len = this.length;
	  start = ~~start;
	  end = end === undefined ? len : ~~end;

	  if (start < 0) {
	    start += len;
	    if (start < 0) start = 0;
	  } else if (start > len) {
	    start = len;
	  }

	  if (end < 0) {
	    end += len;
	    if (end < 0) end = 0;
	  } else if (end > len) {
	    end = len;
	  }

	  if (end < start) end = start;

	  var newBuf;
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    newBuf = this.subarray(start, end);
	    newBuf.__proto__ = Buffer.prototype;
	  } else {
	    var sliceLen = end - start;
	    newBuf = new Buffer(sliceLen, undefined);
	    for (var i = 0; i < sliceLen; ++i) {
	      newBuf[i] = this[i + start];
	    }
	  }

	  return newBuf
	};

	/*
	 * Need to make sure that buffer isn't trying to write out of bounds.
	 */
	function checkOffset (offset, ext, length) {
	  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
	  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
	}

	Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    checkOffset(offset, byteLength, this.length);
	  }

	  var val = this[offset + --byteLength];
	  var mul = 1;
	  while (byteLength > 0 && (mul *= 0x100)) {
	    val += this[offset + --byteLength] * mul;
	  }

	  return val
	};

	Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  return this[offset]
	};

	Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return this[offset] | (this[offset + 1] << 8)
	};

	Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  return (this[offset] << 8) | this[offset + 1]
	};

	Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return ((this[offset]) |
	      (this[offset + 1] << 8) |
	      (this[offset + 2] << 16)) +
	      (this[offset + 3] * 0x1000000)
	};

	Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] * 0x1000000) +
	    ((this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    this[offset + 3])
	};

	Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var val = this[offset];
	  var mul = 1;
	  var i = 0;
	  while (++i < byteLength && (mul *= 0x100)) {
	    val += this[offset + i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) checkOffset(offset, byteLength, this.length);

	  var i = byteLength;
	  var mul = 1;
	  var val = this[offset + --i];
	  while (i > 0 && (mul *= 0x100)) {
	    val += this[offset + --i] * mul;
	  }
	  mul *= 0x80;

	  if (val >= mul) val -= Math.pow(2, 8 * byteLength);

	  return val
	};

	Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 1, this.length);
	  if (!(this[offset] & 0x80)) return (this[offset])
	  return ((0xff - this[offset] + 1) * -1)
	};

	Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset] | (this[offset + 1] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 2, this.length);
	  var val = this[offset + 1] | (this[offset] << 8);
	  return (val & 0x8000) ? val | 0xFFFF0000 : val
	};

	Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset]) |
	    (this[offset + 1] << 8) |
	    (this[offset + 2] << 16) |
	    (this[offset + 3] << 24)
	};

	Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);

	  return (this[offset] << 24) |
	    (this[offset + 1] << 16) |
	    (this[offset + 2] << 8) |
	    (this[offset + 3])
	};

	Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, true, 23, 4)
	};

	Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 4, this.length);
	  return read(this, offset, false, 23, 4)
	};

	Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, true, 52, 8)
	};

	Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
	  if (!noAssert) checkOffset(offset, 8, this.length);
	  return read(this, offset, false, 52, 8)
	};

	function checkInt (buf, value, offset, ext, max, min) {
	  if (!internalIsBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
	  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	}

	Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var mul = 1;
	  var i = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  byteLength = byteLength | 0;
	  if (!noAssert) {
	    var maxBytes = Math.pow(2, 8 * byteLength) - 1;
	    checkInt(this, value, offset, byteLength, maxBytes, 0);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    this[offset + i] = (value / mul) & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	function objectWriteUInt16 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
	    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
	      (littleEndian ? i : 1 - i) * 8;
	  }
	}

	Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	function objectWriteUInt32 (buf, value, offset, littleEndian) {
	  if (value < 0) value = 0xffffffff + value + 1;
	  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
	    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff;
	  }
	}

	Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset + 3] = (value >>> 24);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 1] = (value >>> 8);
	    this[offset] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = 0;
	  var mul = 1;
	  var sub = 0;
	  this[offset] = value & 0xFF;
	  while (++i < byteLength && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) {
	    var limit = Math.pow(2, 8 * byteLength - 1);

	    checkInt(this, value, offset, byteLength, limit - 1, -limit);
	  }

	  var i = byteLength - 1;
	  var mul = 1;
	  var sub = 0;
	  this[offset + i] = value & 0xFF;
	  while (--i >= 0 && (mul *= 0x100)) {
	    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
	      sub = 1;
	    }
	    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF;
	  }

	  return offset + byteLength
	};

	Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80);
	  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value);
	  if (value < 0) value = 0xff + value + 1;
	  this[offset] = (value & 0xff);
	  return offset + 1
	};

	Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	  } else {
	    objectWriteUInt16(this, value, offset, true);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 8);
	    this[offset + 1] = (value & 0xff);
	  } else {
	    objectWriteUInt16(this, value, offset, false);
	  }
	  return offset + 2
	};

	Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value & 0xff);
	    this[offset + 1] = (value >>> 8);
	    this[offset + 2] = (value >>> 16);
	    this[offset + 3] = (value >>> 24);
	  } else {
	    objectWriteUInt32(this, value, offset, true);
	  }
	  return offset + 4
	};

	Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
	  value = +value;
	  offset = offset | 0;
	  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000);
	  if (value < 0) value = 0xffffffff + value + 1;
	  if (Buffer.TYPED_ARRAY_SUPPORT) {
	    this[offset] = (value >>> 24);
	    this[offset + 1] = (value >>> 16);
	    this[offset + 2] = (value >>> 8);
	    this[offset + 3] = (value & 0xff);
	  } else {
	    objectWriteUInt32(this, value, offset, false);
	  }
	  return offset + 4
	};

	function checkIEEE754 (buf, value, offset, ext, max, min) {
	  if (offset + ext > buf.length) throw new RangeError('Index out of range')
	  if (offset < 0) throw new RangeError('Index out of range')
	}

	function writeFloat (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38);
	  }
	  write(buf, value, offset, littleEndian, 23, 4);
	  return offset + 4
	}

	Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
	  return writeFloat(this, value, offset, false, noAssert)
	};

	function writeDouble (buf, value, offset, littleEndian, noAssert) {
	  if (!noAssert) {
	    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308);
	  }
	  write(buf, value, offset, littleEndian, 52, 8);
	  return offset + 8
	}

	Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, true, noAssert)
	};

	Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
	  return writeDouble(this, value, offset, false, noAssert)
	};

	// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
	Buffer.prototype.copy = function copy (target, targetStart, start, end) {
	  if (!start) start = 0;
	  if (!end && end !== 0) end = this.length;
	  if (targetStart >= target.length) targetStart = target.length;
	  if (!targetStart) targetStart = 0;
	  if (end > 0 && end < start) end = start;

	  // Copy 0 bytes; we're done
	  if (end === start) return 0
	  if (target.length === 0 || this.length === 0) return 0

	  // Fatal error conditions
	  if (targetStart < 0) {
	    throw new RangeError('targetStart out of bounds')
	  }
	  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
	  if (end < 0) throw new RangeError('sourceEnd out of bounds')

	  // Are we oob?
	  if (end > this.length) end = this.length;
	  if (target.length - targetStart < end - start) {
	    end = target.length - targetStart + start;
	  }

	  var len = end - start;
	  var i;

	  if (this === target && start < targetStart && targetStart < end) {
	    // descending copy from end
	    for (i = len - 1; i >= 0; --i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
	    // ascending copy from start
	    for (i = 0; i < len; ++i) {
	      target[i + targetStart] = this[i + start];
	    }
	  } else {
	    Uint8Array.prototype.set.call(
	      target,
	      this.subarray(start, start + len),
	      targetStart
	    );
	  }

	  return len
	};

	// Usage:
	//    buffer.fill(number[, offset[, end]])
	//    buffer.fill(buffer[, offset[, end]])
	//    buffer.fill(string[, offset[, end]][, encoding])
	Buffer.prototype.fill = function fill (val, start, end, encoding) {
	  // Handle string cases:
	  if (typeof val === 'string') {
	    if (typeof start === 'string') {
	      encoding = start;
	      start = 0;
	      end = this.length;
	    } else if (typeof end === 'string') {
	      encoding = end;
	      end = this.length;
	    }
	    if (val.length === 1) {
	      var code = val.charCodeAt(0);
	      if (code < 256) {
	        val = code;
	      }
	    }
	    if (encoding !== undefined && typeof encoding !== 'string') {
	      throw new TypeError('encoding must be a string')
	    }
	    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
	      throw new TypeError('Unknown encoding: ' + encoding)
	    }
	  } else if (typeof val === 'number') {
	    val = val & 255;
	  }

	  // Invalid ranges are not set to a default, so can range check early.
	  if (start < 0 || this.length < start || this.length < end) {
	    throw new RangeError('Out of range index')
	  }

	  if (end <= start) {
	    return this
	  }

	  start = start >>> 0;
	  end = end === undefined ? this.length : end >>> 0;

	  if (!val) val = 0;

	  var i;
	  if (typeof val === 'number') {
	    for (i = start; i < end; ++i) {
	      this[i] = val;
	    }
	  } else {
	    var bytes = internalIsBuffer(val)
	      ? val
	      : utf8ToBytes(new Buffer(val, encoding).toString());
	    var len = bytes.length;
	    for (i = 0; i < end - start; ++i) {
	      this[i + start] = bytes[i % len];
	    }
	  }

	  return this
	};

	// HELPER FUNCTIONS
	// ================

	var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g;

	function base64clean (str) {
	  // Node strips out invalid characters like \n and \t from the string, base64-js does not
	  str = stringtrim(str).replace(INVALID_BASE64_RE, '');
	  // Node converts strings with length < 2 to ''
	  if (str.length < 2) return ''
	  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
	  while (str.length % 4 !== 0) {
	    str = str + '=';
	  }
	  return str
	}

	function stringtrim (str) {
	  if (str.trim) return str.trim()
	  return str.replace(/^\s+|\s+$/g, '')
	}

	function toHex (n) {
	  if (n < 16) return '0' + n.toString(16)
	  return n.toString(16)
	}

	function utf8ToBytes (string, units) {
	  units = units || Infinity;
	  var codePoint;
	  var length = string.length;
	  var leadSurrogate = null;
	  var bytes = [];

	  for (var i = 0; i < length; ++i) {
	    codePoint = string.charCodeAt(i);

	    // is surrogate component
	    if (codePoint > 0xD7FF && codePoint < 0xE000) {
	      // last char was a lead
	      if (!leadSurrogate) {
	        // no lead yet
	        if (codePoint > 0xDBFF) {
	          // unexpected trail
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        } else if (i + 1 === length) {
	          // unpaired lead
	          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	          continue
	        }

	        // valid lead
	        leadSurrogate = codePoint;

	        continue
	      }

	      // 2 leads in a row
	      if (codePoint < 0xDC00) {
	        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	        leadSurrogate = codePoint;
	        continue
	      }

	      // valid surrogate pair
	      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000;
	    } else if (leadSurrogate) {
	      // valid bmp char, but last char was a lead
	      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD);
	    }

	    leadSurrogate = null;

	    // encode utf8
	    if (codePoint < 0x80) {
	      if ((units -= 1) < 0) break
	      bytes.push(codePoint);
	    } else if (codePoint < 0x800) {
	      if ((units -= 2) < 0) break
	      bytes.push(
	        codePoint >> 0x6 | 0xC0,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x10000) {
	      if ((units -= 3) < 0) break
	      bytes.push(
	        codePoint >> 0xC | 0xE0,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else if (codePoint < 0x110000) {
	      if ((units -= 4) < 0) break
	      bytes.push(
	        codePoint >> 0x12 | 0xF0,
	        codePoint >> 0xC & 0x3F | 0x80,
	        codePoint >> 0x6 & 0x3F | 0x80,
	        codePoint & 0x3F | 0x80
	      );
	    } else {
	      throw new Error('Invalid code point')
	    }
	  }

	  return bytes
	}

	function asciiToBytes (str) {
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    // Node's code seems to be doing this and not & 0x7F..
	    byteArray.push(str.charCodeAt(i) & 0xFF);
	  }
	  return byteArray
	}

	function utf16leToBytes (str, units) {
	  var c, hi, lo;
	  var byteArray = [];
	  for (var i = 0; i < str.length; ++i) {
	    if ((units -= 2) < 0) break

	    c = str.charCodeAt(i);
	    hi = c >> 8;
	    lo = c % 256;
	    byteArray.push(lo);
	    byteArray.push(hi);
	  }

	  return byteArray
	}


	function base64ToBytes (str) {
	  return toByteArray(base64clean(str))
	}

	function blitBuffer (src, dst, offset, length) {
	  for (var i = 0; i < length; ++i) {
	    if ((i + offset >= dst.length) || (i >= src.length)) break
	    dst[i + offset] = src[i];
	  }
	  return i
	}

	function isnan (val) {
	  return val !== val // eslint-disable-line no-self-compare
	}


	// the following is from is-buffer, also by Feross Aboukhadijeh and with same lisence
	// The _isBuffer check is for Safari 5-7 support, because it's missing
	// Object.prototype.constructor. Remove this eventually
	function isBuffer(obj) {
	  return obj != null && (!!obj._isBuffer || isFastBuffer(obj) || isSlowBuffer(obj))
	}

	function isFastBuffer (obj) {
	  return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
	}

	// For Node v0.10 support. Remove this eventually.
	function isSlowBuffer (obj) {
	  return typeof obj.readFloatLE === 'function' && typeof obj.slice === 'function' && isFastBuffer(obj.slice(0, 0))
	}

	var buffer = /*#__PURE__*/Object.freeze({
		INSPECT_MAX_BYTES: INSPECT_MAX_BYTES,
		kMaxLength: _kMaxLength,
		Buffer: Buffer,
		SlowBuffer: SlowBuffer,
		isBuffer: isBuffer
	});

	var safeBuffer = createCommonjsModule(function (module, exports) {
	/* eslint-disable node/no-deprecated-api */

	var Buffer = buffer.Buffer;

	// alternative to using Object.keys for old browsers
	function copyProps (src, dst) {
	  for (var key in src) {
	    dst[key] = src[key];
	  }
	}
	if (Buffer.from && Buffer.alloc && Buffer.allocUnsafe && Buffer.allocUnsafeSlow) {
	  module.exports = buffer;
	} else {
	  // Copy properties from require('buffer')
	  copyProps(buffer, exports);
	  exports.Buffer = SafeBuffer;
	}

	function SafeBuffer (arg, encodingOrOffset, length) {
	  return Buffer(arg, encodingOrOffset, length)
	}

	SafeBuffer.prototype = Object.create(Buffer.prototype);

	// Copy static methods from Buffer
	copyProps(Buffer, SafeBuffer);

	SafeBuffer.from = function (arg, encodingOrOffset, length) {
	  if (typeof arg === 'number') {
	    throw new TypeError('Argument must not be a number')
	  }
	  return Buffer(arg, encodingOrOffset, length)
	};

	SafeBuffer.alloc = function (size, fill, encoding) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  var buf = Buffer(size);
	  if (fill !== undefined) {
	    if (typeof encoding === 'string') {
	      buf.fill(fill, encoding);
	    } else {
	      buf.fill(fill);
	    }
	  } else {
	    buf.fill(0);
	  }
	  return buf
	};

	SafeBuffer.allocUnsafe = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return Buffer(size)
	};

	SafeBuffer.allocUnsafeSlow = function (size) {
	  if (typeof size !== 'number') {
	    throw new TypeError('Argument must be a number')
	  }
	  return buffer.SlowBuffer(size)
	};
	});
	var safeBuffer_1 = safeBuffer.Buffer;

	var domain;

	// This constructor is used to store event handlers. Instantiating this is
	// faster than explicitly calling `Object.create(null)` to get a "clean" empty
	// object (tested with v8 v4.9).
	function EventHandlers() {}
	EventHandlers.prototype = Object.create(null);

	function EventEmitter() {
	  EventEmitter.init.call(this);
	}

	// nodejs oddity
	// require('events') === require('events').EventEmitter
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.usingDomains = false;

	EventEmitter.prototype.domain = undefined;
	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	EventEmitter.init = function() {
	  this.domain = null;
	  if (EventEmitter.usingDomains) {
	    // if there is an active domain, then attach to it.
	    if (domain.active && !(this instanceof domain.Domain)) ;
	  }

	  if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
	    this._events = new EventHandlers();
	    this._eventsCount = 0;
	  }

	  this._maxListeners = this._maxListeners || undefined;
	};

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
	  if (typeof n !== 'number' || n < 0 || isNaN(n))
	    throw new TypeError('"n" argument must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	function $getMaxListeners(that) {
	  if (that._maxListeners === undefined)
	    return EventEmitter.defaultMaxListeners;
	  return that._maxListeners;
	}

	EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
	  return $getMaxListeners(this);
	};

	// These standalone emit* functions are used to optimize calling of event
	// handlers for fast cases because emit() itself often has a variable number of
	// arguments and can be deoptimized because of that. These functions always have
	// the same number of arguments and thus do not get deoptimized, so the code
	// inside them can execute faster.
	function emitNone(handler, isFn, self) {
	  if (isFn)
	    handler.call(self);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self);
	  }
	}
	function emitOne(handler, isFn, self, arg1) {
	  if (isFn)
	    handler.call(self, arg1);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1);
	  }
	}
	function emitTwo(handler, isFn, self, arg1, arg2) {
	  if (isFn)
	    handler.call(self, arg1, arg2);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2);
	  }
	}
	function emitThree(handler, isFn, self, arg1, arg2, arg3) {
	  if (isFn)
	    handler.call(self, arg1, arg2, arg3);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].call(self, arg1, arg2, arg3);
	  }
	}

	function emitMany(handler, isFn, self, args) {
	  if (isFn)
	    handler.apply(self, args);
	  else {
	    var len = handler.length;
	    var listeners = arrayClone(handler, len);
	    for (var i = 0; i < len; ++i)
	      listeners[i].apply(self, args);
	  }
	}

	EventEmitter.prototype.emit = function emit(type) {
	  var er, handler, len, args, i, events, domain;
	  var doError = (type === 'error');

	  events = this._events;
	  if (events)
	    doError = (doError && events.error == null);
	  else if (!doError)
	    return false;

	  domain = this.domain;

	  // If there is no 'error' event listener then throw.
	  if (doError) {
	    er = arguments[1];
	    if (domain) {
	      if (!er)
	        er = new Error('Uncaught, unspecified "error" event');
	      er.domainEmitter = this;
	      er.domain = domain;
	      er.domainThrown = false;
	      domain.emit('error', er);
	    } else if (er instanceof Error) {
	      throw er; // Unhandled 'error' event
	    } else {
	      // At least give some kind of context to the user
	      var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	      err.context = er;
	      throw err;
	    }
	    return false;
	  }

	  handler = events[type];

	  if (!handler)
	    return false;

	  var isFn = typeof handler === 'function';
	  len = arguments.length;
	  switch (len) {
	    // fast cases
	    case 1:
	      emitNone(handler, isFn, this);
	      break;
	    case 2:
	      emitOne(handler, isFn, this, arguments[1]);
	      break;
	    case 3:
	      emitTwo(handler, isFn, this, arguments[1], arguments[2]);
	      break;
	    case 4:
	      emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
	      break;
	    // slower
	    default:
	      args = new Array(len - 1);
	      for (i = 1; i < len; i++)
	        args[i - 1] = arguments[i];
	      emitMany(handler, isFn, this, args);
	  }

	  return true;
	};

	function _addListener(target, type, listener, prepend) {
	  var m;
	  var events;
	  var existing;

	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');

	  events = target._events;
	  if (!events) {
	    events = target._events = new EventHandlers();
	    target._eventsCount = 0;
	  } else {
	    // To avoid recursion in the case that type === "newListener"! Before
	    // adding it to the listeners, first emit "newListener".
	    if (events.newListener) {
	      target.emit('newListener', type,
	                  listener.listener ? listener.listener : listener);

	      // Re-assign `events` because a newListener handler could have caused the
	      // this._events to be assigned to a new object
	      events = target._events;
	    }
	    existing = events[type];
	  }

	  if (!existing) {
	    // Optimize the case of one listener. Don't need the extra array object.
	    existing = events[type] = listener;
	    ++target._eventsCount;
	  } else {
	    if (typeof existing === 'function') {
	      // Adding the second element, need to change to array.
	      existing = events[type] = prepend ? [listener, existing] :
	                                          [existing, listener];
	    } else {
	      // If we've already got an array, just append.
	      if (prepend) {
	        existing.unshift(listener);
	      } else {
	        existing.push(listener);
	      }
	    }

	    // Check for listener leak
	    if (!existing.warned) {
	      m = $getMaxListeners(target);
	      if (m && m > 0 && existing.length > m) {
	        existing.warned = true;
	        var w = new Error('Possible EventEmitter memory leak detected. ' +
	                            existing.length + ' ' + type + ' listeners added. ' +
	                            'Use emitter.setMaxListeners() to increase limit');
	        w.name = 'MaxListenersExceededWarning';
	        w.emitter = target;
	        w.type = type;
	        w.count = existing.length;
	        emitWarning(w);
	      }
	    }
	  }

	  return target;
	}
	function emitWarning(e) {
	  typeof console.warn === 'function' ? console.warn(e) : console.log(e);
	}
	EventEmitter.prototype.addListener = function addListener(type, listener) {
	  return _addListener(this, type, listener, false);
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.prependListener =
	    function prependListener(type, listener) {
	      return _addListener(this, type, listener, true);
	    };

	function _onceWrap(target, type, listener) {
	  var fired = false;
	  function g() {
	    target.removeListener(type, g);
	    if (!fired) {
	      fired = true;
	      listener.apply(target, arguments);
	    }
	  }
	  g.listener = listener;
	  return g;
	}

	EventEmitter.prototype.once = function once(type, listener) {
	  if (typeof listener !== 'function')
	    throw new TypeError('"listener" argument must be a function');
	  this.on(type, _onceWrap(this, type, listener));
	  return this;
	};

	EventEmitter.prototype.prependOnceListener =
	    function prependOnceListener(type, listener) {
	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');
	      this.prependListener(type, _onceWrap(this, type, listener));
	      return this;
	    };

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener =
	    function removeListener(type, listener) {
	      var list, events, position, i, originalListener;

	      if (typeof listener !== 'function')
	        throw new TypeError('"listener" argument must be a function');

	      events = this._events;
	      if (!events)
	        return this;

	      list = events[type];
	      if (!list)
	        return this;

	      if (list === listener || (list.listener && list.listener === listener)) {
	        if (--this._eventsCount === 0)
	          this._events = new EventHandlers();
	        else {
	          delete events[type];
	          if (events.removeListener)
	            this.emit('removeListener', type, list.listener || listener);
	        }
	      } else if (typeof list !== 'function') {
	        position = -1;

	        for (i = list.length; i-- > 0;) {
	          if (list[i] === listener ||
	              (list[i].listener && list[i].listener === listener)) {
	            originalListener = list[i].listener;
	            position = i;
	            break;
	          }
	        }

	        if (position < 0)
	          return this;

	        if (list.length === 1) {
	          list[0] = undefined;
	          if (--this._eventsCount === 0) {
	            this._events = new EventHandlers();
	            return this;
	          } else {
	            delete events[type];
	          }
	        } else {
	          spliceOne(list, position);
	        }

	        if (events.removeListener)
	          this.emit('removeListener', type, originalListener || listener);
	      }

	      return this;
	    };

	EventEmitter.prototype.removeAllListeners =
	    function removeAllListeners(type) {
	      var listeners, events;

	      events = this._events;
	      if (!events)
	        return this;

	      // not listening for removeListener, no need to emit
	      if (!events.removeListener) {
	        if (arguments.length === 0) {
	          this._events = new EventHandlers();
	          this._eventsCount = 0;
	        } else if (events[type]) {
	          if (--this._eventsCount === 0)
	            this._events = new EventHandlers();
	          else
	            delete events[type];
	        }
	        return this;
	      }

	      // emit removeListener for all listeners on all events
	      if (arguments.length === 0) {
	        var keys = Object.keys(events);
	        for (var i = 0, key; i < keys.length; ++i) {
	          key = keys[i];
	          if (key === 'removeListener') continue;
	          this.removeAllListeners(key);
	        }
	        this.removeAllListeners('removeListener');
	        this._events = new EventHandlers();
	        this._eventsCount = 0;
	        return this;
	      }

	      listeners = events[type];

	      if (typeof listeners === 'function') {
	        this.removeListener(type, listeners);
	      } else if (listeners) {
	        // LIFO order
	        do {
	          this.removeListener(type, listeners[listeners.length - 1]);
	        } while (listeners[0]);
	      }

	      return this;
	    };

	EventEmitter.prototype.listeners = function listeners(type) {
	  var evlistener;
	  var ret;
	  var events = this._events;

	  if (!events)
	    ret = [];
	  else {
	    evlistener = events[type];
	    if (!evlistener)
	      ret = [];
	    else if (typeof evlistener === 'function')
	      ret = [evlistener.listener || evlistener];
	    else
	      ret = unwrapListeners(evlistener);
	  }

	  return ret;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  if (typeof emitter.listenerCount === 'function') {
	    return emitter.listenerCount(type);
	  } else {
	    return listenerCount.call(emitter, type);
	  }
	};

	EventEmitter.prototype.listenerCount = listenerCount;
	function listenerCount(type) {
	  var events = this._events;

	  if (events) {
	    var evlistener = events[type];

	    if (typeof evlistener === 'function') {
	      return 1;
	    } else if (evlistener) {
	      return evlistener.length;
	    }
	  }

	  return 0;
	}

	EventEmitter.prototype.eventNames = function eventNames() {
	  return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
	};

	// About 1.5x faster than the two-arg version of Array#splice().
	function spliceOne(list, index) {
	  for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
	    list[i] = list[k];
	  list.pop();
	}

	function arrayClone(arr, i) {
	  var copy = new Array(i);
	  while (i--)
	    copy[i] = arr[i];
	  return copy;
	}

	function unwrapListeners(arr) {
	  var ret = new Array(arr.length);
	  for (var i = 0; i < ret.length; ++i) {
	    ret[i] = arr[i].listener || arr[i];
	  }
	  return ret;
	}

	// shim for using process in browser
	// based off https://github.com/defunctzombie/node-process/blob/master/browser.js

	function defaultSetTimout() {
	    throw new Error('setTimeout has not been defined');
	}
	function defaultClearTimeout () {
	    throw new Error('clearTimeout has not been defined');
	}
	var cachedSetTimeout = defaultSetTimout;
	var cachedClearTimeout = defaultClearTimeout;
	if (typeof global$1.setTimeout === 'function') {
	    cachedSetTimeout = setTimeout;
	}
	if (typeof global$1.clearTimeout === 'function') {
	    cachedClearTimeout = clearTimeout;
	}

	function runTimeout(fun) {
	    if (cachedSetTimeout === setTimeout) {
	        //normal enviroments in sane situations
	        return setTimeout(fun, 0);
	    }
	    // if setTimeout wasn't available but was latter defined
	    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
	        cachedSetTimeout = setTimeout;
	        return setTimeout(fun, 0);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedSetTimeout(fun, 0);
	    } catch(e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
	            return cachedSetTimeout.call(null, fun, 0);
	        } catch(e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
	            return cachedSetTimeout.call(this, fun, 0);
	        }
	    }


	}
	function runClearTimeout(marker) {
	    if (cachedClearTimeout === clearTimeout) {
	        //normal enviroments in sane situations
	        return clearTimeout(marker);
	    }
	    // if clearTimeout wasn't available but was latter defined
	    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
	        cachedClearTimeout = clearTimeout;
	        return clearTimeout(marker);
	    }
	    try {
	        // when when somebody has screwed with setTimeout but no I.E. maddness
	        return cachedClearTimeout(marker);
	    } catch (e){
	        try {
	            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
	            return cachedClearTimeout.call(null, marker);
	        } catch (e){
	            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
	            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
	            return cachedClearTimeout.call(this, marker);
	        }
	    }



	}
	var queue$1 = [];
	var draining = false;
	var currentQueue;
	var queueIndex = -1;

	function cleanUpNextTick() {
	    if (!draining || !currentQueue) {
	        return;
	    }
	    draining = false;
	    if (currentQueue.length) {
	        queue$1 = currentQueue.concat(queue$1);
	    } else {
	        queueIndex = -1;
	    }
	    if (queue$1.length) {
	        drainQueue();
	    }
	}

	function drainQueue() {
	    if (draining) {
	        return;
	    }
	    var timeout = runTimeout(cleanUpNextTick);
	    draining = true;

	    var len = queue$1.length;
	    while(len) {
	        currentQueue = queue$1;
	        queue$1 = [];
	        while (++queueIndex < len) {
	            if (currentQueue) {
	                currentQueue[queueIndex].run();
	            }
	        }
	        queueIndex = -1;
	        len = queue$1.length;
	    }
	    currentQueue = null;
	    draining = false;
	    runClearTimeout(timeout);
	}
	function nextTick(fun) {
	    var args = new Array(arguments.length - 1);
	    if (arguments.length > 1) {
	        for (var i = 1; i < arguments.length; i++) {
	            args[i - 1] = arguments[i];
	        }
	    }
	    queue$1.push(new Item(fun, args));
	    if (queue$1.length === 1 && !draining) {
	        runTimeout(drainQueue);
	    }
	}
	// v8 likes predictible objects
	function Item(fun, array) {
	    this.fun = fun;
	    this.array = array;
	}
	Item.prototype.run = function () {
	    this.fun.apply(null, this.array);
	};
	var title = 'browser';
	var platform = 'browser';
	var browser = true;
	var env = {};
	var argv = [];
	var version = ''; // empty string to avoid regexp issues
	var versions$1 = {};
	var release = {};
	var config = {};

	function noop() {}

	var on = noop;
	var addListener = noop;
	var once = noop;
	var off = noop;
	var removeListener = noop;
	var removeAllListeners = noop;
	var emit = noop;

	function binding(name) {
	    throw new Error('process.binding is not supported');
	}

	function cwd () { return '/' }
	function chdir (dir) {
	    throw new Error('process.chdir is not supported');
	}function umask() { return 0; }

	// from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
	var performance = global$1.performance || {};
	var performanceNow =
	  performance.now        ||
	  performance.mozNow     ||
	  performance.msNow      ||
	  performance.oNow       ||
	  performance.webkitNow  ||
	  function(){ return (new Date()).getTime() };

	// generate timestamp or delta
	// see http://nodejs.org/api/process.html#process_process_hrtime
	function hrtime(previousTimestamp){
	  var clocktime = performanceNow.call(performance)*1e-3;
	  var seconds = Math.floor(clocktime);
	  var nanoseconds = Math.floor((clocktime%1)*1e9);
	  if (previousTimestamp) {
	    seconds = seconds - previousTimestamp[0];
	    nanoseconds = nanoseconds - previousTimestamp[1];
	    if (nanoseconds<0) {
	      seconds--;
	      nanoseconds += 1e9;
	    }
	  }
	  return [seconds,nanoseconds]
	}

	var startTime = new Date();
	function uptime() {
	  var currentTime = new Date();
	  var dif = currentTime - startTime;
	  return dif / 1000;
	}

	var process$3 = {
	  nextTick: nextTick,
	  title: title,
	  browser: browser,
	  env: env,
	  argv: argv,
	  version: version,
	  versions: versions$1,
	  on: on,
	  addListener: addListener,
	  once: once,
	  off: off,
	  removeListener: removeListener,
	  removeAllListeners: removeAllListeners,
	  emit: emit,
	  binding: binding,
	  cwd: cwd,
	  chdir: chdir,
	  umask: umask,
	  hrtime: hrtime,
	  platform: platform,
	  release: release,
	  config: config,
	  uptime: uptime
	};

	var inherits$1;
	if (typeof Object.create === 'function'){
	  inherits$1 = function inherits(ctor, superCtor) {
	    // implementation from standard node.js 'util' module
	    ctor.super_ = superCtor;
	    ctor.prototype = Object.create(superCtor.prototype, {
	      constructor: {
	        value: ctor,
	        enumerable: false,
	        writable: true,
	        configurable: true
	      }
	    });
	  };
	} else {
	  inherits$1 = function inherits(ctor, superCtor) {
	    ctor.super_ = superCtor;
	    var TempCtor = function () {};
	    TempCtor.prototype = superCtor.prototype;
	    ctor.prototype = new TempCtor();
	    ctor.prototype.constructor = ctor;
	  };
	}
	var inherits$2 = inherits$1;

	var formatRegExp = /%[sdj%]/g;
	function format(f) {
	  if (!isString(f)) {
	    var objects = [];
	    for (var i = 0; i < arguments.length; i++) {
	      objects.push(inspect(arguments[i]));
	    }
	    return objects.join(' ');
	  }

	  var i = 1;
	  var args = arguments;
	  var len = args.length;
	  var str = String(f).replace(formatRegExp, function(x) {
	    if (x === '%%') return '%';
	    if (i >= len) return x;
	    switch (x) {
	      case '%s': return String(args[i++]);
	      case '%d': return Number(args[i++]);
	      case '%j':
	        try {
	          return JSON.stringify(args[i++]);
	        } catch (_) {
	          return '[Circular]';
	        }
	      default:
	        return x;
	    }
	  });
	  for (var x = args[i]; i < len; x = args[++i]) {
	    if (isNull(x) || !isObject(x)) {
	      str += ' ' + x;
	    } else {
	      str += ' ' + inspect(x);
	    }
	  }
	  return str;
	}

	// Mark that a method should not be used.
	// Returns a modified function which warns once by default.
	// If --no-deprecation is set, then it is a no-op.
	function deprecate(fn, msg) {
	  // Allow for deprecating things in the process of starting up.
	  if (isUndefined(global$1.process)) {
	    return function() {
	      return deprecate(fn, msg).apply(this, arguments);
	    };
	  }

	  var warned = false;
	  function deprecated() {
	    if (!warned) {
	      {
	        console.error(msg);
	      }
	      warned = true;
	    }
	    return fn.apply(this, arguments);
	  }

	  return deprecated;
	}

	var debugs = {};
	var debugEnviron;
	function debuglog(set) {
	  if (isUndefined(debugEnviron))
	    debugEnviron = process$3.env.NODE_DEBUG || '';
	  set = set.toUpperCase();
	  if (!debugs[set]) {
	    if (new RegExp('\\b' + set + '\\b', 'i').test(debugEnviron)) {
	      var pid = 0;
	      debugs[set] = function() {
	        var msg = format.apply(null, arguments);
	        console.error('%s %d: %s', set, pid, msg);
	      };
	    } else {
	      debugs[set] = function() {};
	    }
	  }
	  return debugs[set];
	}

	/**
	 * Echos the value of a value. Trys to print the value out
	 * in the best way possible given the different types.
	 *
	 * @param {Object} obj The object to print out.
	 * @param {Object} opts Optional options object that alters the output.
	 */
	/* legacy: obj, showHidden, depth, colors*/
	function inspect(obj, opts) {
	  // default options
	  var ctx = {
	    seen: [],
	    stylize: stylizeNoColor
	  };
	  // legacy...
	  if (arguments.length >= 3) ctx.depth = arguments[2];
	  if (arguments.length >= 4) ctx.colors = arguments[3];
	  if (isBoolean(opts)) {
	    // legacy...
	    ctx.showHidden = opts;
	  } else if (opts) {
	    // got an "options" object
	    _extend(ctx, opts);
	  }
	  // set default options
	  if (isUndefined(ctx.showHidden)) ctx.showHidden = false;
	  if (isUndefined(ctx.depth)) ctx.depth = 2;
	  if (isUndefined(ctx.colors)) ctx.colors = false;
	  if (isUndefined(ctx.customInspect)) ctx.customInspect = true;
	  if (ctx.colors) ctx.stylize = stylizeWithColor;
	  return formatValue(ctx, obj, ctx.depth);
	}

	// http://en.wikipedia.org/wiki/ANSI_escape_code#graphics
	inspect.colors = {
	  'bold' : [1, 22],
	  'italic' : [3, 23],
	  'underline' : [4, 24],
	  'inverse' : [7, 27],
	  'white' : [37, 39],
	  'grey' : [90, 39],
	  'black' : [30, 39],
	  'blue' : [34, 39],
	  'cyan' : [36, 39],
	  'green' : [32, 39],
	  'magenta' : [35, 39],
	  'red' : [31, 39],
	  'yellow' : [33, 39]
	};

	// Don't use 'blue' not visible on cmd.exe
	inspect.styles = {
	  'special': 'cyan',
	  'number': 'yellow',
	  'boolean': 'yellow',
	  'undefined': 'grey',
	  'null': 'bold',
	  'string': 'green',
	  'date': 'magenta',
	  // "name": intentionally not styling
	  'regexp': 'red'
	};


	function stylizeWithColor(str, styleType) {
	  var style = inspect.styles[styleType];

	  if (style) {
	    return '\u001b[' + inspect.colors[style][0] + 'm' + str +
	           '\u001b[' + inspect.colors[style][1] + 'm';
	  } else {
	    return str;
	  }
	}


	function stylizeNoColor(str, styleType) {
	  return str;
	}


	function arrayToHash(array) {
	  var hash = {};

	  array.forEach(function(val, idx) {
	    hash[val] = true;
	  });

	  return hash;
	}


	function formatValue(ctx, value, recurseTimes) {
	  // Provide a hook for user-specified inspect functions.
	  // Check that value is an object with an inspect function on it
	  if (ctx.customInspect &&
	      value &&
	      isFunction(value.inspect) &&
	      // Filter out the util module, it's inspect function is special
	      value.inspect !== inspect &&
	      // Also filter out any prototype objects using the circular check.
	      !(value.constructor && value.constructor.prototype === value)) {
	    var ret = value.inspect(recurseTimes, ctx);
	    if (!isString(ret)) {
	      ret = formatValue(ctx, ret, recurseTimes);
	    }
	    return ret;
	  }

	  // Primitive types cannot have properties
	  var primitive = formatPrimitive(ctx, value);
	  if (primitive) {
	    return primitive;
	  }

	  // Look up the keys of the object.
	  var keys = Object.keys(value);
	  var visibleKeys = arrayToHash(keys);

	  if (ctx.showHidden) {
	    keys = Object.getOwnPropertyNames(value);
	  }

	  // IE doesn't make error fields non-enumerable
	  // http://msdn.microsoft.com/en-us/library/ie/dww52sbt(v=vs.94).aspx
	  if (isError(value)
	      && (keys.indexOf('message') >= 0 || keys.indexOf('description') >= 0)) {
	    return formatError(value);
	  }

	  // Some type of object without properties can be shortcutted.
	  if (keys.length === 0) {
	    if (isFunction(value)) {
	      var name = value.name ? ': ' + value.name : '';
	      return ctx.stylize('[Function' + name + ']', 'special');
	    }
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    }
	    if (isDate(value)) {
	      return ctx.stylize(Date.prototype.toString.call(value), 'date');
	    }
	    if (isError(value)) {
	      return formatError(value);
	    }
	  }

	  var base = '', array = false, braces = ['{', '}'];

	  // Make Array say that they are Array
	  if (isArray$1(value)) {
	    array = true;
	    braces = ['[', ']'];
	  }

	  // Make functions say that they are functions
	  if (isFunction(value)) {
	    var n = value.name ? ': ' + value.name : '';
	    base = ' [Function' + n + ']';
	  }

	  // Make RegExps say that they are RegExps
	  if (isRegExp(value)) {
	    base = ' ' + RegExp.prototype.toString.call(value);
	  }

	  // Make dates with properties first say the date
	  if (isDate(value)) {
	    base = ' ' + Date.prototype.toUTCString.call(value);
	  }

	  // Make error with message first say the error
	  if (isError(value)) {
	    base = ' ' + formatError(value);
	  }

	  if (keys.length === 0 && (!array || value.length == 0)) {
	    return braces[0] + base + braces[1];
	  }

	  if (recurseTimes < 0) {
	    if (isRegExp(value)) {
	      return ctx.stylize(RegExp.prototype.toString.call(value), 'regexp');
	    } else {
	      return ctx.stylize('[Object]', 'special');
	    }
	  }

	  ctx.seen.push(value);

	  var output;
	  if (array) {
	    output = formatArray(ctx, value, recurseTimes, visibleKeys, keys);
	  } else {
	    output = keys.map(function(key) {
	      return formatProperty(ctx, value, recurseTimes, visibleKeys, key, array);
	    });
	  }

	  ctx.seen.pop();

	  return reduceToSingleString(output, base, braces);
	}


	function formatPrimitive(ctx, value) {
	  if (isUndefined(value))
	    return ctx.stylize('undefined', 'undefined');
	  if (isString(value)) {
	    var simple = '\'' + JSON.stringify(value).replace(/^"|"$/g, '')
	                                             .replace(/'/g, "\\'")
	                                             .replace(/\\"/g, '"') + '\'';
	    return ctx.stylize(simple, 'string');
	  }
	  if (isNumber(value))
	    return ctx.stylize('' + value, 'number');
	  if (isBoolean(value))
	    return ctx.stylize('' + value, 'boolean');
	  // For some reason typeof null is "object", so special case here.
	  if (isNull(value))
	    return ctx.stylize('null', 'null');
	}


	function formatError(value) {
	  return '[' + Error.prototype.toString.call(value) + ']';
	}


	function formatArray(ctx, value, recurseTimes, visibleKeys, keys) {
	  var output = [];
	  for (var i = 0, l = value.length; i < l; ++i) {
	    if (hasOwnProperty$1(value, String(i))) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          String(i), true));
	    } else {
	      output.push('');
	    }
	  }
	  keys.forEach(function(key) {
	    if (!key.match(/^\d+$/)) {
	      output.push(formatProperty(ctx, value, recurseTimes, visibleKeys,
	          key, true));
	    }
	  });
	  return output;
	}


	function formatProperty(ctx, value, recurseTimes, visibleKeys, key, array) {
	  var name, str, desc;
	  desc = Object.getOwnPropertyDescriptor(value, key) || { value: value[key] };
	  if (desc.get) {
	    if (desc.set) {
	      str = ctx.stylize('[Getter/Setter]', 'special');
	    } else {
	      str = ctx.stylize('[Getter]', 'special');
	    }
	  } else {
	    if (desc.set) {
	      str = ctx.stylize('[Setter]', 'special');
	    }
	  }
	  if (!hasOwnProperty$1(visibleKeys, key)) {
	    name = '[' + key + ']';
	  }
	  if (!str) {
	    if (ctx.seen.indexOf(desc.value) < 0) {
	      if (isNull(recurseTimes)) {
	        str = formatValue(ctx, desc.value, null);
	      } else {
	        str = formatValue(ctx, desc.value, recurseTimes - 1);
	      }
	      if (str.indexOf('\n') > -1) {
	        if (array) {
	          str = str.split('\n').map(function(line) {
	            return '  ' + line;
	          }).join('\n').substr(2);
	        } else {
	          str = '\n' + str.split('\n').map(function(line) {
	            return '   ' + line;
	          }).join('\n');
	        }
	      }
	    } else {
	      str = ctx.stylize('[Circular]', 'special');
	    }
	  }
	  if (isUndefined(name)) {
	    if (array && key.match(/^\d+$/)) {
	      return str;
	    }
	    name = JSON.stringify('' + key);
	    if (name.match(/^"([a-zA-Z_][a-zA-Z_0-9]*)"$/)) {
	      name = name.substr(1, name.length - 2);
	      name = ctx.stylize(name, 'name');
	    } else {
	      name = name.replace(/'/g, "\\'")
	                 .replace(/\\"/g, '"')
	                 .replace(/(^"|"$)/g, "'");
	      name = ctx.stylize(name, 'string');
	    }
	  }

	  return name + ': ' + str;
	}


	function reduceToSingleString(output, base, braces) {
	  var length = output.reduce(function(prev, cur) {
	    if (cur.indexOf('\n') >= 0) ;
	    return prev + cur.replace(/\u001b\[\d\d?m/g, '').length + 1;
	  }, 0);

	  if (length > 60) {
	    return braces[0] +
	           (base === '' ? '' : base + '\n ') +
	           ' ' +
	           output.join(',\n  ') +
	           ' ' +
	           braces[1];
	  }

	  return braces[0] + base + ' ' + output.join(', ') + ' ' + braces[1];
	}


	// NOTE: These type checking functions intentionally don't use `instanceof`
	// because it is fragile and can be easily faked with `Object.create()`.
	function isArray$1(ar) {
	  return Array.isArray(ar);
	}

	function isBoolean(arg) {
	  return typeof arg === 'boolean';
	}

	function isNull(arg) {
	  return arg === null;
	}

	function isNullOrUndefined(arg) {
	  return arg == null;
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isString(arg) {
	  return typeof arg === 'string';
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}

	function isRegExp(re) {
	  return isObject(re) && objectToString(re) === '[object RegExp]';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isDate(d) {
	  return isObject(d) && objectToString(d) === '[object Date]';
	}

	function isError(e) {
	  return isObject(e) &&
	      (objectToString(e) === '[object Error]' || e instanceof Error);
	}

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function objectToString(o) {
	  return Object.prototype.toString.call(o);
	}

	function _extend(origin, add) {
	  // Don't do anything if add isn't an object
	  if (!add || !isObject(add)) return origin;

	  var keys = Object.keys(add);
	  var i = keys.length;
	  while (i--) {
	    origin[keys[i]] = add[keys[i]];
	  }
	  return origin;
	}
	function hasOwnProperty$1(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}

	function BufferList() {
	  this.head = null;
	  this.tail = null;
	  this.length = 0;
	}

	BufferList.prototype.push = function (v) {
	  var entry = { data: v, next: null };
	  if (this.length > 0) this.tail.next = entry;else this.head = entry;
	  this.tail = entry;
	  ++this.length;
	};

	BufferList.prototype.unshift = function (v) {
	  var entry = { data: v, next: this.head };
	  if (this.length === 0) this.tail = entry;
	  this.head = entry;
	  ++this.length;
	};

	BufferList.prototype.shift = function () {
	  if (this.length === 0) return;
	  var ret = this.head.data;
	  if (this.length === 1) this.head = this.tail = null;else this.head = this.head.next;
	  --this.length;
	  return ret;
	};

	BufferList.prototype.clear = function () {
	  this.head = this.tail = null;
	  this.length = 0;
	};

	BufferList.prototype.join = function (s) {
	  if (this.length === 0) return '';
	  var p = this.head;
	  var ret = '' + p.data;
	  while (p = p.next) {
	    ret += s + p.data;
	  }return ret;
	};

	BufferList.prototype.concat = function (n) {
	  if (this.length === 0) return Buffer.alloc(0);
	  if (this.length === 1) return this.head.data;
	  var ret = Buffer.allocUnsafe(n >>> 0);
	  var p = this.head;
	  var i = 0;
	  while (p) {
	    p.data.copy(ret, i);
	    i += p.data.length;
	    p = p.next;
	  }
	  return ret;
	};

	// Copyright Joyent, Inc. and other Node contributors.
	var isBufferEncoding = Buffer.isEncoding
	  || function(encoding) {
	       switch (encoding && encoding.toLowerCase()) {
	         case 'hex': case 'utf8': case 'utf-8': case 'ascii': case 'binary': case 'base64': case 'ucs2': case 'ucs-2': case 'utf16le': case 'utf-16le': case 'raw': return true;
	         default: return false;
	       }
	     };


	function assertEncoding(encoding) {
	  if (encoding && !isBufferEncoding(encoding)) {
	    throw new Error('Unknown encoding: ' + encoding);
	  }
	}

	// StringDecoder provides an interface for efficiently splitting a series of
	// buffers into a series of JS strings without breaking apart multi-byte
	// characters. CESU-8 is handled as part of the UTF-8 encoding.
	//
	// @TODO Handling all encodings inside a single object makes it very difficult
	// to reason about this code, so it should be split up in the future.
	// @TODO There should be a utf8-strict encoding that rejects invalid UTF-8 code
	// points as used by CESU-8.
	function StringDecoder(encoding) {
	  this.encoding = (encoding || 'utf8').toLowerCase().replace(/[-_]/, '');
	  assertEncoding(encoding);
	  switch (this.encoding) {
	    case 'utf8':
	      // CESU-8 represents each of Surrogate Pair by 3-bytes
	      this.surrogateSize = 3;
	      break;
	    case 'ucs2':
	    case 'utf16le':
	      // UTF-16 represents each of Surrogate Pair by 2-bytes
	      this.surrogateSize = 2;
	      this.detectIncompleteChar = utf16DetectIncompleteChar;
	      break;
	    case 'base64':
	      // Base-64 stores 3 bytes in 4 chars, and pads the remainder.
	      this.surrogateSize = 3;
	      this.detectIncompleteChar = base64DetectIncompleteChar;
	      break;
	    default:
	      this.write = passThroughWrite;
	      return;
	  }

	  // Enough space to store all bytes of a single character. UTF-8 needs 4
	  // bytes, but CESU-8 may require up to 6 (3 bytes per surrogate).
	  this.charBuffer = new Buffer(6);
	  // Number of bytes received for the current incomplete multi-byte character.
	  this.charReceived = 0;
	  // Number of bytes expected for the current incomplete multi-byte character.
	  this.charLength = 0;
	}

	// write decodes the given buffer and returns it as JS string that is
	// guaranteed to not contain any partial multi-byte characters. Any partial
	// character found at the end of the buffer is buffered up, and will be
	// returned when calling write again with the remaining bytes.
	//
	// Note: Converting a Buffer containing an orphan surrogate to a String
	// currently works, but converting a String to a Buffer (via `new Buffer`, or
	// Buffer#write) will replace incomplete surrogates with the unicode
	// replacement character. See https://codereview.chromium.org/121173009/ .
	StringDecoder.prototype.write = function(buffer) {
	  var charStr = '';
	  // if our last write ended with an incomplete multibyte character
	  while (this.charLength) {
	    // determine how many remaining bytes this buffer has to offer for this char
	    var available = (buffer.length >= this.charLength - this.charReceived) ?
	        this.charLength - this.charReceived :
	        buffer.length;

	    // add the new bytes to the char buffer
	    buffer.copy(this.charBuffer, this.charReceived, 0, available);
	    this.charReceived += available;

	    if (this.charReceived < this.charLength) {
	      // still not enough chars in this buffer? wait for more ...
	      return '';
	    }

	    // remove bytes belonging to the current character from the buffer
	    buffer = buffer.slice(available, buffer.length);

	    // get the character that was split
	    charStr = this.charBuffer.slice(0, this.charLength).toString(this.encoding);

	    // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	    var charCode = charStr.charCodeAt(charStr.length - 1);
	    if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	      this.charLength += this.surrogateSize;
	      charStr = '';
	      continue;
	    }
	    this.charReceived = this.charLength = 0;

	    // if there are no more bytes in this buffer, just emit our char
	    if (buffer.length === 0) {
	      return charStr;
	    }
	    break;
	  }

	  // determine and set charLength / charReceived
	  this.detectIncompleteChar(buffer);

	  var end = buffer.length;
	  if (this.charLength) {
	    // buffer the incomplete character bytes we got
	    buffer.copy(this.charBuffer, 0, buffer.length - this.charReceived, end);
	    end -= this.charReceived;
	  }

	  charStr += buffer.toString(this.encoding, 0, end);

	  var end = charStr.length - 1;
	  var charCode = charStr.charCodeAt(end);
	  // CESU-8: lead surrogate (D800-DBFF) is also the incomplete character
	  if (charCode >= 0xD800 && charCode <= 0xDBFF) {
	    var size = this.surrogateSize;
	    this.charLength += size;
	    this.charReceived += size;
	    this.charBuffer.copy(this.charBuffer, size, 0, size);
	    buffer.copy(this.charBuffer, 0, 0, size);
	    return charStr.substring(0, end);
	  }

	  // or just emit the charStr
	  return charStr;
	};

	// detectIncompleteChar determines if there is an incomplete UTF-8 character at
	// the end of the given buffer. If so, it sets this.charLength to the byte
	// length that character, and sets this.charReceived to the number of bytes
	// that are available for this character.
	StringDecoder.prototype.detectIncompleteChar = function(buffer) {
	  // determine how many bytes we have to check at the end of this buffer
	  var i = (buffer.length >= 3) ? 3 : buffer.length;

	  // Figure out if one of the last i bytes of our buffer announces an
	  // incomplete char.
	  for (; i > 0; i--) {
	    var c = buffer[buffer.length - i];

	    // See http://en.wikipedia.org/wiki/UTF-8#Description

	    // 110XXXXX
	    if (i == 1 && c >> 5 == 0x06) {
	      this.charLength = 2;
	      break;
	    }

	    // 1110XXXX
	    if (i <= 2 && c >> 4 == 0x0E) {
	      this.charLength = 3;
	      break;
	    }

	    // 11110XXX
	    if (i <= 3 && c >> 3 == 0x1E) {
	      this.charLength = 4;
	      break;
	    }
	  }
	  this.charReceived = i;
	};

	StringDecoder.prototype.end = function(buffer) {
	  var res = '';
	  if (buffer && buffer.length)
	    res = this.write(buffer);

	  if (this.charReceived) {
	    var cr = this.charReceived;
	    var buf = this.charBuffer;
	    var enc = this.encoding;
	    res += buf.slice(0, cr).toString(enc);
	  }

	  return res;
	};

	function passThroughWrite(buffer) {
	  return buffer.toString(this.encoding);
	}

	function utf16DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 2;
	  this.charLength = this.charReceived ? 2 : 0;
	}

	function base64DetectIncompleteChar(buffer) {
	  this.charReceived = buffer.length % 3;
	  this.charLength = this.charReceived ? 3 : 0;
	}

	var stringDecoder = /*#__PURE__*/Object.freeze({
		StringDecoder: StringDecoder
	});

	Readable.ReadableState = ReadableState;

	var debug = debuglog('stream');
	inherits$2(Readable, EventEmitter);

	function prependListener(emitter, event, fn) {
	  // Sadly this is not cacheable as some libraries bundle their own
	  // event emitter implementation with them.
	  if (typeof emitter.prependListener === 'function') {
	    return emitter.prependListener(event, fn);
	  } else {
	    // This is a hack to make sure that our error handler is attached before any
	    // userland ones.  NEVER DO THIS. This is here only because this code needs
	    // to continue to work with older versions of Node.js that do not include
	    // the prependListener() method. The goal is to eventually remove this hack.
	    if (!emitter._events || !emitter._events[event])
	      emitter.on(event, fn);
	    else if (Array.isArray(emitter._events[event]))
	      emitter._events[event].unshift(fn);
	    else
	      emitter._events[event] = [fn, emitter._events[event]];
	  }
	}
	function listenerCount$1 (emitter, type) {
	  return emitter.listeners(type).length;
	}
	function ReadableState(options, stream) {

	  options = options || {};

	  // object stream flag. Used to make read(n) ignore n and to
	  // make all the buffer merging and length checks go away
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.readableObjectMode;

	  // the point at which it stops calling _read() to fill the buffer
	  // Note: 0 is a valid value, means "don't call _read preemptively ever"
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~ ~this.highWaterMark;

	  // A linked list is used to store data chunks instead of an array because the
	  // linked list can remove elements from the beginning faster than
	  // array.shift()
	  this.buffer = new BufferList();
	  this.length = 0;
	  this.pipes = null;
	  this.pipesCount = 0;
	  this.flowing = null;
	  this.ended = false;
	  this.endEmitted = false;
	  this.reading = false;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // whenever we return null, then we set a flag to say
	  // that we're awaiting a 'readable' event emission.
	  this.needReadable = false;
	  this.emittedReadable = false;
	  this.readableListening = false;
	  this.resumeScheduled = false;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // when piping, we only care about 'readable' events that happen
	  // after read()ing all the bytes and not getting any pushback.
	  this.ranOut = false;

	  // the number of writers that are awaiting a drain event in .pipe()s
	  this.awaitDrain = 0;

	  // if true, a maybeReadMore has been scheduled
	  this.readingMore = false;

	  this.decoder = null;
	  this.encoding = null;
	  if (options.encoding) {
	    this.decoder = new StringDecoder(options.encoding);
	    this.encoding = options.encoding;
	  }
	}
	function Readable(options) {

	  if (!(this instanceof Readable)) return new Readable(options);

	  this._readableState = new ReadableState(options, this);

	  // legacy
	  this.readable = true;

	  if (options && typeof options.read === 'function') this._read = options.read;

	  EventEmitter.call(this);
	}

	// Manually shove something into the read() buffer.
	// This returns true if the highWaterMark has not been hit yet,
	// similar to how Writable.write() returns true if you should
	// write() some more.
	Readable.prototype.push = function (chunk, encoding) {
	  var state = this._readableState;

	  if (!state.objectMode && typeof chunk === 'string') {
	    encoding = encoding || state.defaultEncoding;
	    if (encoding !== state.encoding) {
	      chunk = Buffer.from(chunk, encoding);
	      encoding = '';
	    }
	  }

	  return readableAddChunk(this, state, chunk, encoding, false);
	};

	// Unshift should *always* be something directly out of read()
	Readable.prototype.unshift = function (chunk) {
	  var state = this._readableState;
	  return readableAddChunk(this, state, chunk, '', true);
	};

	Readable.prototype.isPaused = function () {
	  return this._readableState.flowing === false;
	};

	function readableAddChunk(stream, state, chunk, encoding, addToFront) {
	  var er = chunkInvalid(state, chunk);
	  if (er) {
	    stream.emit('error', er);
	  } else if (chunk === null) {
	    state.reading = false;
	    onEofChunk(stream, state);
	  } else if (state.objectMode || chunk && chunk.length > 0) {
	    if (state.ended && !addToFront) {
	      var e = new Error('stream.push() after EOF');
	      stream.emit('error', e);
	    } else if (state.endEmitted && addToFront) {
	      var _e = new Error('stream.unshift() after end event');
	      stream.emit('error', _e);
	    } else {
	      var skipAdd;
	      if (state.decoder && !addToFront && !encoding) {
	        chunk = state.decoder.write(chunk);
	        skipAdd = !state.objectMode && chunk.length === 0;
	      }

	      if (!addToFront) state.reading = false;

	      // Don't add to the buffer if we've decoded to an empty string chunk and
	      // we're not in object mode
	      if (!skipAdd) {
	        // if we want the data now, just emit it.
	        if (state.flowing && state.length === 0 && !state.sync) {
	          stream.emit('data', chunk);
	          stream.read(0);
	        } else {
	          // update the buffer info.
	          state.length += state.objectMode ? 1 : chunk.length;
	          if (addToFront) state.buffer.unshift(chunk);else state.buffer.push(chunk);

	          if (state.needReadable) emitReadable(stream);
	        }
	      }

	      maybeReadMore(stream, state);
	    }
	  } else if (!addToFront) {
	    state.reading = false;
	  }

	  return needMoreData(state);
	}

	// if it's past the high water mark, we can push in some more.
	// Also, if we have no data yet, we can stand some
	// more bytes.  This is to work around cases where hwm=0,
	// such as the repl.  Also, if the push() triggered a
	// readable event, and the user called read(largeNumber) such that
	// needReadable was set, then we ought to push more, so that another
	// 'readable' event will be triggered.
	function needMoreData(state) {
	  return !state.ended && (state.needReadable || state.length < state.highWaterMark || state.length === 0);
	}

	// backwards compatibility.
	Readable.prototype.setEncoding = function (enc) {
	  this._readableState.decoder = new StringDecoder(enc);
	  this._readableState.encoding = enc;
	  return this;
	};

	// Don't raise the hwm > 8MB
	var MAX_HWM = 0x800000;
	function computeNewHighWaterMark(n) {
	  if (n >= MAX_HWM) {
	    n = MAX_HWM;
	  } else {
	    // Get the next highest power of 2 to prevent increasing hwm excessively in
	    // tiny amounts
	    n--;
	    n |= n >>> 1;
	    n |= n >>> 2;
	    n |= n >>> 4;
	    n |= n >>> 8;
	    n |= n >>> 16;
	    n++;
	  }
	  return n;
	}

	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function howMuchToRead(n, state) {
	  if (n <= 0 || state.length === 0 && state.ended) return 0;
	  if (state.objectMode) return 1;
	  if (n !== n) {
	    // Only flow one buffer at a time
	    if (state.flowing && state.length) return state.buffer.head.data.length;else return state.length;
	  }
	  // If we're asking for more than the current hwm, then raise the hwm.
	  if (n > state.highWaterMark) state.highWaterMark = computeNewHighWaterMark(n);
	  if (n <= state.length) return n;
	  // Don't have enough
	  if (!state.ended) {
	    state.needReadable = true;
	    return 0;
	  }
	  return state.length;
	}

	// you can override either this method, or the async _read(n) below.
	Readable.prototype.read = function (n) {
	  debug('read', n);
	  n = parseInt(n, 10);
	  var state = this._readableState;
	  var nOrig = n;

	  if (n !== 0) state.emittedReadable = false;

	  // if we're doing read(0) to trigger a readable event, but we
	  // already have a bunch of data in the buffer, then just trigger
	  // the 'readable' event and move on.
	  if (n === 0 && state.needReadable && (state.length >= state.highWaterMark || state.ended)) {
	    debug('read: emitReadable', state.length, state.ended);
	    if (state.length === 0 && state.ended) endReadable(this);else emitReadable(this);
	    return null;
	  }

	  n = howMuchToRead(n, state);

	  // if we've ended, and we're now clear, then finish it up.
	  if (n === 0 && state.ended) {
	    if (state.length === 0) endReadable(this);
	    return null;
	  }

	  // All the actual chunk generation logic needs to be
	  // *below* the call to _read.  The reason is that in certain
	  // synthetic stream cases, such as passthrough streams, _read
	  // may be a completely synchronous operation which may change
	  // the state of the read buffer, providing enough data when
	  // before there was *not* enough.
	  //
	  // So, the steps are:
	  // 1. Figure out what the state of things will be after we do
	  // a read from the buffer.
	  //
	  // 2. If that resulting state will trigger a _read, then call _read.
	  // Note that this may be asynchronous, or synchronous.  Yes, it is
	  // deeply ugly to write APIs this way, but that still doesn't mean
	  // that the Readable class should behave improperly, as streams are
	  // designed to be sync/async agnostic.
	  // Take note if the _read call is sync or async (ie, if the read call
	  // has returned yet), so that we know whether or not it's safe to emit
	  // 'readable' etc.
	  //
	  // 3. Actually pull the requested chunks out of the buffer and return.

	  // if we need a readable event, then we need to do some reading.
	  var doRead = state.needReadable;
	  debug('need readable', doRead);

	  // if we currently have less than the highWaterMark, then also read some
	  if (state.length === 0 || state.length - n < state.highWaterMark) {
	    doRead = true;
	    debug('length less than watermark', doRead);
	  }

	  // however, if we've ended, then there's no point, and if we're already
	  // reading, then it's unnecessary.
	  if (state.ended || state.reading) {
	    doRead = false;
	    debug('reading or ended', doRead);
	  } else if (doRead) {
	    debug('do read');
	    state.reading = true;
	    state.sync = true;
	    // if the length is currently zero, then we *need* a readable event.
	    if (state.length === 0) state.needReadable = true;
	    // call internal read method
	    this._read(state.highWaterMark);
	    state.sync = false;
	    // If _read pushed data synchronously, then `reading` will be false,
	    // and we need to re-evaluate how much data we can return to the user.
	    if (!state.reading) n = howMuchToRead(nOrig, state);
	  }

	  var ret;
	  if (n > 0) ret = fromList(n, state);else ret = null;

	  if (ret === null) {
	    state.needReadable = true;
	    n = 0;
	  } else {
	    state.length -= n;
	  }

	  if (state.length === 0) {
	    // If we have nothing in the buffer, then we want to know
	    // as soon as we *do* get something into the buffer.
	    if (!state.ended) state.needReadable = true;

	    // If we tried to read() past the EOF, then emit end on the next tick.
	    if (nOrig !== n && state.ended) endReadable(this);
	  }

	  if (ret !== null) this.emit('data', ret);

	  return ret;
	};

	function chunkInvalid(state, chunk) {
	  var er = null;
	  if (!isBuffer(chunk) && typeof chunk !== 'string' && chunk !== null && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  return er;
	}

	function onEofChunk(stream, state) {
	  if (state.ended) return;
	  if (state.decoder) {
	    var chunk = state.decoder.end();
	    if (chunk && chunk.length) {
	      state.buffer.push(chunk);
	      state.length += state.objectMode ? 1 : chunk.length;
	    }
	  }
	  state.ended = true;

	  // emit 'readable' now to make sure it gets picked up.
	  emitReadable(stream);
	}

	// Don't emit readable right away in sync mode, because this can trigger
	// another read() call => stack overflow.  This way, it might trigger
	// a nextTick recursion warning, but that's not so bad.
	function emitReadable(stream) {
	  var state = stream._readableState;
	  state.needReadable = false;
	  if (!state.emittedReadable) {
	    debug('emitReadable', state.flowing);
	    state.emittedReadable = true;
	    if (state.sync) nextTick(emitReadable_, stream);else emitReadable_(stream);
	  }
	}

	function emitReadable_(stream) {
	  debug('emit readable');
	  stream.emit('readable');
	  flow(stream);
	}

	// at this point, the user has presumably seen the 'readable' event,
	// and called read() to consume some data.  that may have triggered
	// in turn another _read(n) call, in which case reading = true if
	// it's in progress.
	// However, if we're not ended, or reading, and the length < hwm,
	// then go ahead and try to read some more preemptively.
	function maybeReadMore(stream, state) {
	  if (!state.readingMore) {
	    state.readingMore = true;
	    nextTick(maybeReadMore_, stream, state);
	  }
	}

	function maybeReadMore_(stream, state) {
	  var len = state.length;
	  while (!state.reading && !state.flowing && !state.ended && state.length < state.highWaterMark) {
	    debug('maybeReadMore read 0');
	    stream.read(0);
	    if (len === state.length)
	      // didn't get any data, stop spinning.
	      break;else len = state.length;
	  }
	  state.readingMore = false;
	}

	// abstract method.  to be overridden in specific implementation classes.
	// call cb(er, data) where data is <= n in length.
	// for virtual (non-string, non-buffer) streams, "length" is somewhat
	// arbitrary, and perhaps not very meaningful.
	Readable.prototype._read = function (n) {
	  this.emit('error', new Error('not implemented'));
	};

	Readable.prototype.pipe = function (dest, pipeOpts) {
	  var src = this;
	  var state = this._readableState;

	  switch (state.pipesCount) {
	    case 0:
	      state.pipes = dest;
	      break;
	    case 1:
	      state.pipes = [state.pipes, dest];
	      break;
	    default:
	      state.pipes.push(dest);
	      break;
	  }
	  state.pipesCount += 1;
	  debug('pipe count=%d opts=%j', state.pipesCount, pipeOpts);

	  var doEnd = (!pipeOpts || pipeOpts.end !== false);

	  var endFn = doEnd ? onend : cleanup;
	  if (state.endEmitted) nextTick(endFn);else src.once('end', endFn);

	  dest.on('unpipe', onunpipe);
	  function onunpipe(readable) {
	    debug('onunpipe');
	    if (readable === src) {
	      cleanup();
	    }
	  }

	  function onend() {
	    debug('onend');
	    dest.end();
	  }

	  // when the dest drains, it reduces the awaitDrain counter
	  // on the source.  This would be more elegant with a .once()
	  // handler in flow(), but adding and removing repeatedly is
	  // too slow.
	  var ondrain = pipeOnDrain(src);
	  dest.on('drain', ondrain);

	  var cleanedUp = false;
	  function cleanup() {
	    debug('cleanup');
	    // cleanup event handlers once the pipe is broken
	    dest.removeListener('close', onclose);
	    dest.removeListener('finish', onfinish);
	    dest.removeListener('drain', ondrain);
	    dest.removeListener('error', onerror);
	    dest.removeListener('unpipe', onunpipe);
	    src.removeListener('end', onend);
	    src.removeListener('end', cleanup);
	    src.removeListener('data', ondata);

	    cleanedUp = true;

	    // if the reader is waiting for a drain event from this
	    // specific writer, then it would cause it to never start
	    // flowing again.
	    // So, if this is awaiting a drain, then we just call it now.
	    // If we don't know, then assume that we are waiting for one.
	    if (state.awaitDrain && (!dest._writableState || dest._writableState.needDrain)) ondrain();
	  }

	  // If the user pushes more data while we're writing to dest then we'll end up
	  // in ondata again. However, we only want to increase awaitDrain once because
	  // dest will only emit one 'drain' event for the multiple writes.
	  // => Introduce a guard on increasing awaitDrain.
	  var increasedAwaitDrain = false;
	  src.on('data', ondata);
	  function ondata(chunk) {
	    debug('ondata');
	    increasedAwaitDrain = false;
	    var ret = dest.write(chunk);
	    if (false === ret && !increasedAwaitDrain) {
	      // If the user unpiped during `dest.write()`, it is possible
	      // to get stuck in a permanently paused state if that write
	      // also returned false.
	      // => Check whether `dest` is still a piping destination.
	      if ((state.pipesCount === 1 && state.pipes === dest || state.pipesCount > 1 && indexOf(state.pipes, dest) !== -1) && !cleanedUp) {
	        debug('false write response, pause', src._readableState.awaitDrain);
	        src._readableState.awaitDrain++;
	        increasedAwaitDrain = true;
	      }
	      src.pause();
	    }
	  }

	  // if the dest has an error, then stop piping into it.
	  // however, don't suppress the throwing behavior for this.
	  function onerror(er) {
	    debug('onerror', er);
	    unpipe();
	    dest.removeListener('error', onerror);
	    if (listenerCount$1(dest, 'error') === 0) dest.emit('error', er);
	  }

	  // Make sure our error handler is attached before userland ones.
	  prependListener(dest, 'error', onerror);

	  // Both close and finish should trigger unpipe, but only once.
	  function onclose() {
	    dest.removeListener('finish', onfinish);
	    unpipe();
	  }
	  dest.once('close', onclose);
	  function onfinish() {
	    debug('onfinish');
	    dest.removeListener('close', onclose);
	    unpipe();
	  }
	  dest.once('finish', onfinish);

	  function unpipe() {
	    debug('unpipe');
	    src.unpipe(dest);
	  }

	  // tell the dest that it's being piped to
	  dest.emit('pipe', src);

	  // start the flow if it hasn't been started already.
	  if (!state.flowing) {
	    debug('pipe resume');
	    src.resume();
	  }

	  return dest;
	};

	function pipeOnDrain(src) {
	  return function () {
	    var state = src._readableState;
	    debug('pipeOnDrain', state.awaitDrain);
	    if (state.awaitDrain) state.awaitDrain--;
	    if (state.awaitDrain === 0 && src.listeners('data').length) {
	      state.flowing = true;
	      flow(src);
	    }
	  };
	}

	Readable.prototype.unpipe = function (dest) {
	  var state = this._readableState;

	  // if we're not piping anywhere, then do nothing.
	  if (state.pipesCount === 0) return this;

	  // just one destination.  most common case.
	  if (state.pipesCount === 1) {
	    // passed in one, but it's not the right one.
	    if (dest && dest !== state.pipes) return this;

	    if (!dest) dest = state.pipes;

	    // got a match.
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;
	    if (dest) dest.emit('unpipe', this);
	    return this;
	  }

	  // slow case. multiple pipe destinations.

	  if (!dest) {
	    // remove all.
	    var dests = state.pipes;
	    var len = state.pipesCount;
	    state.pipes = null;
	    state.pipesCount = 0;
	    state.flowing = false;

	    for (var _i = 0; _i < len; _i++) {
	      dests[_i].emit('unpipe', this);
	    }return this;
	  }

	  // try to find the right one.
	  var i = indexOf(state.pipes, dest);
	  if (i === -1) return this;

	  state.pipes.splice(i, 1);
	  state.pipesCount -= 1;
	  if (state.pipesCount === 1) state.pipes = state.pipes[0];

	  dest.emit('unpipe', this);

	  return this;
	};

	// set up data events if they are asked for
	// Ensure readable listeners eventually get something
	Readable.prototype.on = function (ev, fn) {
	  var res = EventEmitter.prototype.on.call(this, ev, fn);

	  if (ev === 'data') {
	    // Start flowing on next tick if stream isn't explicitly paused
	    if (this._readableState.flowing !== false) this.resume();
	  } else if (ev === 'readable') {
	    var state = this._readableState;
	    if (!state.endEmitted && !state.readableListening) {
	      state.readableListening = state.needReadable = true;
	      state.emittedReadable = false;
	      if (!state.reading) {
	        nextTick(nReadingNextTick, this);
	      } else if (state.length) {
	        emitReadable(this, state);
	      }
	    }
	  }

	  return res;
	};
	Readable.prototype.addListener = Readable.prototype.on;

	function nReadingNextTick(self) {
	  debug('readable nexttick read 0');
	  self.read(0);
	}

	// pause() and resume() are remnants of the legacy readable stream API
	// If the user uses them, then switch into old mode.
	Readable.prototype.resume = function () {
	  var state = this._readableState;
	  if (!state.flowing) {
	    debug('resume');
	    state.flowing = true;
	    resume(this, state);
	  }
	  return this;
	};

	function resume(stream, state) {
	  if (!state.resumeScheduled) {
	    state.resumeScheduled = true;
	    nextTick(resume_, stream, state);
	  }
	}

	function resume_(stream, state) {
	  if (!state.reading) {
	    debug('resume read 0');
	    stream.read(0);
	  }

	  state.resumeScheduled = false;
	  state.awaitDrain = 0;
	  stream.emit('resume');
	  flow(stream);
	  if (state.flowing && !state.reading) stream.read(0);
	}

	Readable.prototype.pause = function () {
	  debug('call pause flowing=%j', this._readableState.flowing);
	  if (false !== this._readableState.flowing) {
	    debug('pause');
	    this._readableState.flowing = false;
	    this.emit('pause');
	  }
	  return this;
	};

	function flow(stream) {
	  var state = stream._readableState;
	  debug('flow', state.flowing);
	  while (state.flowing && stream.read() !== null) {}
	}

	// wrap an old-style stream as the async data source.
	// This is *not* part of the readable stream interface.
	// It is an ugly unfortunate mess of history.
	Readable.prototype.wrap = function (stream) {
	  var state = this._readableState;
	  var paused = false;

	  var self = this;
	  stream.on('end', function () {
	    debug('wrapped end');
	    if (state.decoder && !state.ended) {
	      var chunk = state.decoder.end();
	      if (chunk && chunk.length) self.push(chunk);
	    }

	    self.push(null);
	  });

	  stream.on('data', function (chunk) {
	    debug('wrapped data');
	    if (state.decoder) chunk = state.decoder.write(chunk);

	    // don't skip over falsy values in objectMode
	    if (state.objectMode && (chunk === null || chunk === undefined)) return;else if (!state.objectMode && (!chunk || !chunk.length)) return;

	    var ret = self.push(chunk);
	    if (!ret) {
	      paused = true;
	      stream.pause();
	    }
	  });

	  // proxy all the other methods.
	  // important when wrapping filters and duplexes.
	  for (var i in stream) {
	    if (this[i] === undefined && typeof stream[i] === 'function') {
	      this[i] = function (method) {
	        return function () {
	          return stream[method].apply(stream, arguments);
	        };
	      }(i);
	    }
	  }

	  // proxy certain important events.
	  var events = ['error', 'close', 'destroy', 'pause', 'resume'];
	  forEach(events, function (ev) {
	    stream.on(ev, self.emit.bind(self, ev));
	  });

	  // when we try to consume some more bytes, simply unpause the
	  // underlying stream.
	  self._read = function (n) {
	    debug('wrapped _read', n);
	    if (paused) {
	      paused = false;
	      stream.resume();
	    }
	  };

	  return self;
	};

	// exposed for testing purposes only.
	Readable._fromList = fromList;

	// Pluck off n bytes from an array of buffers.
	// Length is the combined lengths of all the buffers in the list.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromList(n, state) {
	  // nothing buffered
	  if (state.length === 0) return null;

	  var ret;
	  if (state.objectMode) ret = state.buffer.shift();else if (!n || n >= state.length) {
	    // read it all, truncate the list
	    if (state.decoder) ret = state.buffer.join('');else if (state.buffer.length === 1) ret = state.buffer.head.data;else ret = state.buffer.concat(state.length);
	    state.buffer.clear();
	  } else {
	    // read part of list
	    ret = fromListPartial(n, state.buffer, state.decoder);
	  }

	  return ret;
	}

	// Extracts only enough buffered data to satisfy the amount requested.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function fromListPartial(n, list, hasStrings) {
	  var ret;
	  if (n < list.head.data.length) {
	    // slice is the same for buffers and strings
	    ret = list.head.data.slice(0, n);
	    list.head.data = list.head.data.slice(n);
	  } else if (n === list.head.data.length) {
	    // first chunk is a perfect match
	    ret = list.shift();
	  } else {
	    // result spans more than one buffer
	    ret = hasStrings ? copyFromBufferString(n, list) : copyFromBuffer(n, list);
	  }
	  return ret;
	}

	// Copies a specified amount of characters from the list of buffered data
	// chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBufferString(n, list) {
	  var p = list.head;
	  var c = 1;
	  var ret = p.data;
	  n -= ret.length;
	  while (p = p.next) {
	    var str = p.data;
	    var nb = n > str.length ? str.length : n;
	    if (nb === str.length) ret += str;else ret += str.slice(0, n);
	    n -= nb;
	    if (n === 0) {
	      if (nb === str.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = str.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	// Copies a specified amount of bytes from the list of buffered data chunks.
	// This function is designed to be inlinable, so please take care when making
	// changes to the function body.
	function copyFromBuffer(n, list) {
	  var ret = Buffer.allocUnsafe(n);
	  var p = list.head;
	  var c = 1;
	  p.data.copy(ret);
	  n -= p.data.length;
	  while (p = p.next) {
	    var buf = p.data;
	    var nb = n > buf.length ? buf.length : n;
	    buf.copy(ret, ret.length - n, 0, nb);
	    n -= nb;
	    if (n === 0) {
	      if (nb === buf.length) {
	        ++c;
	        if (p.next) list.head = p.next;else list.head = list.tail = null;
	      } else {
	        list.head = p;
	        p.data = buf.slice(nb);
	      }
	      break;
	    }
	    ++c;
	  }
	  list.length -= c;
	  return ret;
	}

	function endReadable(stream) {
	  var state = stream._readableState;

	  // If we get here before consuming all the bytes, then that is a
	  // bug in node.  Should never happen.
	  if (state.length > 0) throw new Error('"endReadable()" called on non-empty stream');

	  if (!state.endEmitted) {
	    state.ended = true;
	    nextTick(endReadableNT, state, stream);
	  }
	}

	function endReadableNT(state, stream) {
	  // Check that we didn't get one last unshift.
	  if (!state.endEmitted && state.length === 0) {
	    state.endEmitted = true;
	    stream.readable = false;
	    stream.emit('end');
	  }
	}

	function forEach(xs, f) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    f(xs[i], i);
	  }
	}

	function indexOf(xs, x) {
	  for (var i = 0, l = xs.length; i < l; i++) {
	    if (xs[i] === x) return i;
	  }
	  return -1;
	}

	// A bit simpler than readable streams.
	Writable.WritableState = WritableState;
	inherits$2(Writable, EventEmitter);

	function nop() {}

	function WriteReq(chunk, encoding, cb) {
	  this.chunk = chunk;
	  this.encoding = encoding;
	  this.callback = cb;
	  this.next = null;
	}

	function WritableState(options, stream) {
	  Object.defineProperty(this, 'buffer', {
	    get: deprecate(function () {
	      return this.getBuffer();
	    }, '_writableState.buffer is deprecated. Use _writableState.getBuffer ' + 'instead.')
	  });
	  options = options || {};

	  // object stream flag to indicate whether or not this stream
	  // contains buffers or objects.
	  this.objectMode = !!options.objectMode;

	  if (stream instanceof Duplex) this.objectMode = this.objectMode || !!options.writableObjectMode;

	  // the point at which write() starts returning false
	  // Note: 0 is a valid value, means that we always return false if
	  // the entire buffer is not flushed immediately on write()
	  var hwm = options.highWaterMark;
	  var defaultHwm = this.objectMode ? 16 : 16 * 1024;
	  this.highWaterMark = hwm || hwm === 0 ? hwm : defaultHwm;

	  // cast to ints.
	  this.highWaterMark = ~ ~this.highWaterMark;

	  this.needDrain = false;
	  // at the start of calling end()
	  this.ending = false;
	  // when end() has been called, and returned
	  this.ended = false;
	  // when 'finish' is emitted
	  this.finished = false;

	  // should we decode strings into buffers before passing to _write?
	  // this is here so that some node-core streams can optimize string
	  // handling at a lower level.
	  var noDecode = options.decodeStrings === false;
	  this.decodeStrings = !noDecode;

	  // Crypto is kind of old and crusty.  Historically, its default string
	  // encoding is 'binary' so we have to make this configurable.
	  // Everything else in the universe uses 'utf8', though.
	  this.defaultEncoding = options.defaultEncoding || 'utf8';

	  // not an actual buffer we keep track of, but a measurement
	  // of how much we're waiting to get pushed to some underlying
	  // socket or file.
	  this.length = 0;

	  // a flag to see when we're in the middle of a write.
	  this.writing = false;

	  // when true all writes will be buffered until .uncork() call
	  this.corked = 0;

	  // a flag to be able to tell if the onwrite cb is called immediately,
	  // or on a later tick.  We set this to true at first, because any
	  // actions that shouldn't happen until "later" should generally also
	  // not happen before the first write call.
	  this.sync = true;

	  // a flag to know if we're processing previously buffered items, which
	  // may call the _write() callback in the same tick, so that we don't
	  // end up in an overlapped onwrite situation.
	  this.bufferProcessing = false;

	  // the callback that's passed to _write(chunk,cb)
	  this.onwrite = function (er) {
	    onwrite(stream, er);
	  };

	  // the callback that the user supplies to write(chunk,encoding,cb)
	  this.writecb = null;

	  // the amount that is being written when _write is called.
	  this.writelen = 0;

	  this.bufferedRequest = null;
	  this.lastBufferedRequest = null;

	  // number of pending user-supplied write callbacks
	  // this must be 0 before 'finish' can be emitted
	  this.pendingcb = 0;

	  // emit prefinish if the only thing we're waiting for is _write cbs
	  // This is relevant for synchronous Transform streams
	  this.prefinished = false;

	  // True if the error was already emitted and should not be thrown again
	  this.errorEmitted = false;

	  // count buffered requests
	  this.bufferedRequestCount = 0;

	  // allocate the first CorkedRequest, there is always
	  // one allocated and free to use, and we maintain at most two
	  this.corkedRequestsFree = new CorkedRequest(this);
	}

	WritableState.prototype.getBuffer = function writableStateGetBuffer() {
	  var current = this.bufferedRequest;
	  var out = [];
	  while (current) {
	    out.push(current);
	    current = current.next;
	  }
	  return out;
	};
	function Writable(options) {

	  // Writable ctor is applied to Duplexes, though they're not
	  // instanceof Writable, they're instanceof Readable.
	  if (!(this instanceof Writable) && !(this instanceof Duplex)) return new Writable(options);

	  this._writableState = new WritableState(options, this);

	  // legacy.
	  this.writable = true;

	  if (options) {
	    if (typeof options.write === 'function') this._write = options.write;

	    if (typeof options.writev === 'function') this._writev = options.writev;
	  }

	  EventEmitter.call(this);
	}

	// Otherwise people can pipe Writable streams, which is just wrong.
	Writable.prototype.pipe = function () {
	  this.emit('error', new Error('Cannot pipe, not readable'));
	};

	function writeAfterEnd(stream, cb) {
	  var er = new Error('write after end');
	  // TODO: defer error events consistently everywhere, not just the cb
	  stream.emit('error', er);
	  nextTick(cb, er);
	}

	// If we get something that is not a buffer, string, null, or undefined,
	// and we're not in objectMode, then that's an error.
	// Otherwise stream chunks are all considered to be of length=1, and the
	// watermarks determine how many objects to keep in the buffer, rather than
	// how many bytes or characters.
	function validChunk(stream, state, chunk, cb) {
	  var valid = true;
	  var er = false;
	  // Always throw error if a null is written
	  // if we are not in object mode then throw
	  // if it is not a buffer, string, or undefined.
	  if (chunk === null) {
	    er = new TypeError('May not write null values to stream');
	  } else if (!Buffer.isBuffer(chunk) && typeof chunk !== 'string' && chunk !== undefined && !state.objectMode) {
	    er = new TypeError('Invalid non-string/buffer chunk');
	  }
	  if (er) {
	    stream.emit('error', er);
	    nextTick(cb, er);
	    valid = false;
	  }
	  return valid;
	}

	Writable.prototype.write = function (chunk, encoding, cb) {
	  var state = this._writableState;
	  var ret = false;

	  if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (Buffer.isBuffer(chunk)) encoding = 'buffer';else if (!encoding) encoding = state.defaultEncoding;

	  if (typeof cb !== 'function') cb = nop;

	  if (state.ended) writeAfterEnd(this, cb);else if (validChunk(this, state, chunk, cb)) {
	    state.pendingcb++;
	    ret = writeOrBuffer(this, state, chunk, encoding, cb);
	  }

	  return ret;
	};

	Writable.prototype.cork = function () {
	  var state = this._writableState;

	  state.corked++;
	};

	Writable.prototype.uncork = function () {
	  var state = this._writableState;

	  if (state.corked) {
	    state.corked--;

	    if (!state.writing && !state.corked && !state.finished && !state.bufferProcessing && state.bufferedRequest) clearBuffer(this, state);
	  }
	};

	Writable.prototype.setDefaultEncoding = function setDefaultEncoding(encoding) {
	  // node::ParseEncoding() requires lower case.
	  if (typeof encoding === 'string') encoding = encoding.toLowerCase();
	  if (!(['hex', 'utf8', 'utf-8', 'ascii', 'binary', 'base64', 'ucs2', 'ucs-2', 'utf16le', 'utf-16le', 'raw'].indexOf((encoding + '').toLowerCase()) > -1)) throw new TypeError('Unknown encoding: ' + encoding);
	  this._writableState.defaultEncoding = encoding;
	  return this;
	};

	function decodeChunk(state, chunk, encoding) {
	  if (!state.objectMode && state.decodeStrings !== false && typeof chunk === 'string') {
	    chunk = Buffer.from(chunk, encoding);
	  }
	  return chunk;
	}

	// if we're already writing something, then just put this
	// in the queue, and wait our turn.  Otherwise, call _write
	// If we return false, then we need a drain event, so set that flag.
	function writeOrBuffer(stream, state, chunk, encoding, cb) {
	  chunk = decodeChunk(state, chunk, encoding);

	  if (Buffer.isBuffer(chunk)) encoding = 'buffer';
	  var len = state.objectMode ? 1 : chunk.length;

	  state.length += len;

	  var ret = state.length < state.highWaterMark;
	  // we must ensure that previous needDrain will not be reset to false.
	  if (!ret) state.needDrain = true;

	  if (state.writing || state.corked) {
	    var last = state.lastBufferedRequest;
	    state.lastBufferedRequest = new WriteReq(chunk, encoding, cb);
	    if (last) {
	      last.next = state.lastBufferedRequest;
	    } else {
	      state.bufferedRequest = state.lastBufferedRequest;
	    }
	    state.bufferedRequestCount += 1;
	  } else {
	    doWrite(stream, state, false, len, chunk, encoding, cb);
	  }

	  return ret;
	}

	function doWrite(stream, state, writev, len, chunk, encoding, cb) {
	  state.writelen = len;
	  state.writecb = cb;
	  state.writing = true;
	  state.sync = true;
	  if (writev) stream._writev(chunk, state.onwrite);else stream._write(chunk, encoding, state.onwrite);
	  state.sync = false;
	}

	function onwriteError(stream, state, sync, er, cb) {
	  --state.pendingcb;
	  if (sync) nextTick(cb, er);else cb(er);

	  stream._writableState.errorEmitted = true;
	  stream.emit('error', er);
	}

	function onwriteStateUpdate(state) {
	  state.writing = false;
	  state.writecb = null;
	  state.length -= state.writelen;
	  state.writelen = 0;
	}

	function onwrite(stream, er) {
	  var state = stream._writableState;
	  var sync = state.sync;
	  var cb = state.writecb;

	  onwriteStateUpdate(state);

	  if (er) onwriteError(stream, state, sync, er, cb);else {
	    // Check if we're actually ready to finish, but don't emit yet
	    var finished = needFinish(state);

	    if (!finished && !state.corked && !state.bufferProcessing && state.bufferedRequest) {
	      clearBuffer(stream, state);
	    }

	    if (sync) {
	      /*<replacement>*/
	        nextTick(afterWrite, stream, state, finished, cb);
	      /*</replacement>*/
	    } else {
	        afterWrite(stream, state, finished, cb);
	      }
	  }
	}

	function afterWrite(stream, state, finished, cb) {
	  if (!finished) onwriteDrain(stream, state);
	  state.pendingcb--;
	  cb();
	  finishMaybe(stream, state);
	}

	// Must force callback to be called on nextTick, so that we don't
	// emit 'drain' before the write() consumer gets the 'false' return
	// value, and has a chance to attach a 'drain' listener.
	function onwriteDrain(stream, state) {
	  if (state.length === 0 && state.needDrain) {
	    state.needDrain = false;
	    stream.emit('drain');
	  }
	}

	// if there's something in the buffer waiting, then process it
	function clearBuffer(stream, state) {
	  state.bufferProcessing = true;
	  var entry = state.bufferedRequest;

	  if (stream._writev && entry && entry.next) {
	    // Fast case, write everything using _writev()
	    var l = state.bufferedRequestCount;
	    var buffer = new Array(l);
	    var holder = state.corkedRequestsFree;
	    holder.entry = entry;

	    var count = 0;
	    while (entry) {
	      buffer[count] = entry;
	      entry = entry.next;
	      count += 1;
	    }

	    doWrite(stream, state, true, state.length, buffer, '', holder.finish);

	    // doWrite is almost always async, defer these to save a bit of time
	    // as the hot path ends with doWrite
	    state.pendingcb++;
	    state.lastBufferedRequest = null;
	    if (holder.next) {
	      state.corkedRequestsFree = holder.next;
	      holder.next = null;
	    } else {
	      state.corkedRequestsFree = new CorkedRequest(state);
	    }
	  } else {
	    // Slow case, write chunks one-by-one
	    while (entry) {
	      var chunk = entry.chunk;
	      var encoding = entry.encoding;
	      var cb = entry.callback;
	      var len = state.objectMode ? 1 : chunk.length;

	      doWrite(stream, state, false, len, chunk, encoding, cb);
	      entry = entry.next;
	      // if we didn't call the onwrite immediately, then
	      // it means that we need to wait until it does.
	      // also, that means that the chunk and cb are currently
	      // being processed, so move the buffer counter past them.
	      if (state.writing) {
	        break;
	      }
	    }

	    if (entry === null) state.lastBufferedRequest = null;
	  }

	  state.bufferedRequestCount = 0;
	  state.bufferedRequest = entry;
	  state.bufferProcessing = false;
	}

	Writable.prototype._write = function (chunk, encoding, cb) {
	  cb(new Error('not implemented'));
	};

	Writable.prototype._writev = null;

	Writable.prototype.end = function (chunk, encoding, cb) {
	  var state = this._writableState;

	  if (typeof chunk === 'function') {
	    cb = chunk;
	    chunk = null;
	    encoding = null;
	  } else if (typeof encoding === 'function') {
	    cb = encoding;
	    encoding = null;
	  }

	  if (chunk !== null && chunk !== undefined) this.write(chunk, encoding);

	  // .end() fully uncorks
	  if (state.corked) {
	    state.corked = 1;
	    this.uncork();
	  }

	  // ignore unnecessary end() calls.
	  if (!state.ending && !state.finished) endWritable(this, state, cb);
	};

	function needFinish(state) {
	  return state.ending && state.length === 0 && state.bufferedRequest === null && !state.finished && !state.writing;
	}

	function prefinish(stream, state) {
	  if (!state.prefinished) {
	    state.prefinished = true;
	    stream.emit('prefinish');
	  }
	}

	function finishMaybe(stream, state) {
	  var need = needFinish(state);
	  if (need) {
	    if (state.pendingcb === 0) {
	      prefinish(stream, state);
	      state.finished = true;
	      stream.emit('finish');
	    } else {
	      prefinish(stream, state);
	    }
	  }
	  return need;
	}

	function endWritable(stream, state, cb) {
	  state.ending = true;
	  finishMaybe(stream, state);
	  if (cb) {
	    if (state.finished) nextTick(cb);else stream.once('finish', cb);
	  }
	  state.ended = true;
	  stream.writable = false;
	}

	// It seems a linked list but it is not
	// there will be only 2 of these for each stream
	function CorkedRequest(state) {
	  var _this = this;

	  this.next = null;
	  this.entry = null;

	  this.finish = function (err) {
	    var entry = _this.entry;
	    _this.entry = null;
	    while (entry) {
	      var cb = entry.callback;
	      state.pendingcb--;
	      cb(err);
	      entry = entry.next;
	    }
	    if (state.corkedRequestsFree) {
	      state.corkedRequestsFree.next = _this;
	    } else {
	      state.corkedRequestsFree = _this;
	    }
	  };
	}

	inherits$2(Duplex, Readable);

	var keys$2 = Object.keys(Writable.prototype);
	for (var v = 0; v < keys$2.length; v++) {
	  var method = keys$2[v];
	  if (!Duplex.prototype[method]) Duplex.prototype[method] = Writable.prototype[method];
	}
	function Duplex(options) {
	  if (!(this instanceof Duplex)) return new Duplex(options);

	  Readable.call(this, options);
	  Writable.call(this, options);

	  if (options && options.readable === false) this.readable = false;

	  if (options && options.writable === false) this.writable = false;

	  this.allowHalfOpen = true;
	  if (options && options.allowHalfOpen === false) this.allowHalfOpen = false;

	  this.once('end', onend);
	}

	// the no-half-open enforcer
	function onend() {
	  // if we allow half-open state, or if the writable side ended,
	  // then we're ok.
	  if (this.allowHalfOpen || this._writableState.ended) return;

	  // no more data can be written.
	  // But allow more writes to happen in this tick.
	  nextTick(onEndNT, this);
	}

	function onEndNT(self) {
	  self.end();
	}

	// a transform stream is a readable/writable stream where you do
	inherits$2(Transform, Duplex);

	function TransformState(stream) {
	  this.afterTransform = function (er, data) {
	    return afterTransform(stream, er, data);
	  };

	  this.needTransform = false;
	  this.transforming = false;
	  this.writecb = null;
	  this.writechunk = null;
	  this.writeencoding = null;
	}

	function afterTransform(stream, er, data) {
	  var ts = stream._transformState;
	  ts.transforming = false;

	  var cb = ts.writecb;

	  if (!cb) return stream.emit('error', new Error('no writecb in Transform class'));

	  ts.writechunk = null;
	  ts.writecb = null;

	  if (data !== null && data !== undefined) stream.push(data);

	  cb(er);

	  var rs = stream._readableState;
	  rs.reading = false;
	  if (rs.needReadable || rs.length < rs.highWaterMark) {
	    stream._read(rs.highWaterMark);
	  }
	}
	function Transform(options) {
	  if (!(this instanceof Transform)) return new Transform(options);

	  Duplex.call(this, options);

	  this._transformState = new TransformState(this);

	  // when the writable side finishes, then flush out anything remaining.
	  var stream = this;

	  // start out asking for a readable event once data is transformed.
	  this._readableState.needReadable = true;

	  // we have implemented the _read method, and done the other things
	  // that Readable wants before the first _read call, so unset the
	  // sync guard flag.
	  this._readableState.sync = false;

	  if (options) {
	    if (typeof options.transform === 'function') this._transform = options.transform;

	    if (typeof options.flush === 'function') this._flush = options.flush;
	  }

	  this.once('prefinish', function () {
	    if (typeof this._flush === 'function') this._flush(function (er) {
	      done(stream, er);
	    });else done(stream);
	  });
	}

	Transform.prototype.push = function (chunk, encoding) {
	  this._transformState.needTransform = false;
	  return Duplex.prototype.push.call(this, chunk, encoding);
	};

	// This is the part where you do stuff!
	// override this function in implementation classes.
	// 'chunk' is an input chunk.
	//
	// Call `push(newChunk)` to pass along transformed output
	// to the readable side.  You may call 'push' zero or more times.
	//
	// Call `cb(err)` when you are done with this chunk.  If you pass
	// an error, then that'll put the hurt on the whole operation.  If you
	// never call cb(), then you'll never get another chunk.
	Transform.prototype._transform = function (chunk, encoding, cb) {
	  throw new Error('Not implemented');
	};

	Transform.prototype._write = function (chunk, encoding, cb) {
	  var ts = this._transformState;
	  ts.writecb = cb;
	  ts.writechunk = chunk;
	  ts.writeencoding = encoding;
	  if (!ts.transforming) {
	    var rs = this._readableState;
	    if (ts.needTransform || rs.needReadable || rs.length < rs.highWaterMark) this._read(rs.highWaterMark);
	  }
	};

	// Doesn't matter what the args are here.
	// _transform does all the work.
	// That we got here means that the readable side wants more data.
	Transform.prototype._read = function (n) {
	  var ts = this._transformState;

	  if (ts.writechunk !== null && ts.writecb && !ts.transforming) {
	    ts.transforming = true;
	    this._transform(ts.writechunk, ts.writeencoding, ts.afterTransform);
	  } else {
	    // mark that we need a transform, so that any data that comes in
	    // will get processed, now that we've asked for it.
	    ts.needTransform = true;
	  }
	};

	function done(stream, er) {
	  if (er) return stream.emit('error', er);

	  // if there's nothing in the write buffer, then that means
	  // that nothing more will ever be provided
	  var ws = stream._writableState;
	  var ts = stream._transformState;

	  if (ws.length) throw new Error('Calling transform done when ws.length != 0');

	  if (ts.transforming) throw new Error('Calling transform done when still transforming');

	  return stream.push(null);
	}

	inherits$2(PassThrough, Transform);
	function PassThrough(options) {
	  if (!(this instanceof PassThrough)) return new PassThrough(options);

	  Transform.call(this, options);
	}

	PassThrough.prototype._transform = function (chunk, encoding, cb) {
	  cb(null, chunk);
	};

	inherits$2(Stream, EventEmitter);
	Stream.Readable = Readable;
	Stream.Writable = Writable;
	Stream.Duplex = Duplex;
	Stream.Transform = Transform;
	Stream.PassThrough = PassThrough;

	// Backwards-compat with node 0.4.x
	Stream.Stream = Stream;

	// old-style streams.  Note that the pipe method (the only relevant
	// part of this class) is overridden in the Readable class.

	function Stream() {
	  EventEmitter.call(this);
	}

	Stream.prototype.pipe = function(dest, options) {
	  var source = this;

	  function ondata(chunk) {
	    if (dest.writable) {
	      if (false === dest.write(chunk) && source.pause) {
	        source.pause();
	      }
	    }
	  }

	  source.on('data', ondata);

	  function ondrain() {
	    if (source.readable && source.resume) {
	      source.resume();
	    }
	  }

	  dest.on('drain', ondrain);

	  // If the 'end' option is not supplied, dest.end() will be called when
	  // source gets the 'end' or 'close' events.  Only dest.end() once.
	  if (!dest._isStdio && (!options || options.end !== false)) {
	    source.on('end', onend);
	    source.on('close', onclose);
	  }

	  var didOnEnd = false;
	  function onend() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    dest.end();
	  }


	  function onclose() {
	    if (didOnEnd) return;
	    didOnEnd = true;

	    if (typeof dest.destroy === 'function') dest.destroy();
	  }

	  // don't leave dangling pipes when there are errors.
	  function onerror(er) {
	    cleanup();
	    if (EventEmitter.listenerCount(this, 'error') === 0) {
	      throw er; // Unhandled stream error in pipe.
	    }
	  }

	  source.on('error', onerror);
	  dest.on('error', onerror);

	  // remove all the event listeners that were added.
	  function cleanup() {
	    source.removeListener('data', ondata);
	    dest.removeListener('drain', ondrain);

	    source.removeListener('end', onend);
	    source.removeListener('close', onclose);

	    source.removeListener('error', onerror);
	    dest.removeListener('error', onerror);

	    source.removeListener('end', cleanup);
	    source.removeListener('close', cleanup);

	    dest.removeListener('close', cleanup);
	  }

	  source.on('end', cleanup);
	  source.on('close', cleanup);

	  dest.on('close', cleanup);

	  dest.emit('pipe', source);

	  // Allow for unix-like usage: A.pipe(B).pipe(C)
	  return dest;
	};

	var Buffer$1 = safeBuffer.Buffer;
	var Transform$1 = Stream.Transform;


	function throwIfNotStringOrBuffer (val, prefix) {
	  if (!Buffer$1.isBuffer(val) && typeof val !== 'string') {
	    throw new TypeError(prefix + ' must be a string or a buffer')
	  }
	}

	function HashBase (blockSize) {
	  Transform$1.call(this);

	  this._block = Buffer$1.allocUnsafe(blockSize);
	  this._blockSize = blockSize;
	  this._blockOffset = 0;
	  this._length = [0, 0, 0, 0];

	  this._finalized = false;
	}

	inherits_browser(HashBase, Transform$1);

	HashBase.prototype._transform = function (chunk, encoding, callback) {
	  var error = null;
	  try {
	    this.update(chunk, encoding);
	  } catch (err) {
	    error = err;
	  }

	  callback(error);
	};

	HashBase.prototype._flush = function (callback) {
	  var error = null;
	  try {
	    this.push(this.digest());
	  } catch (err) {
	    error = err;
	  }

	  callback(error);
	};

	HashBase.prototype.update = function (data, encoding) {
	  throwIfNotStringOrBuffer(data, 'Data');
	  if (this._finalized) throw new Error('Digest already called')
	  if (!Buffer$1.isBuffer(data)) data = Buffer$1.from(data, encoding);

	  // consume data
	  var block = this._block;
	  var offset = 0;
	  while (this._blockOffset + data.length - offset >= this._blockSize) {
	    for (var i = this._blockOffset; i < this._blockSize;) block[i++] = data[offset++];
	    this._update();
	    this._blockOffset = 0;
	  }
	  while (offset < data.length) block[this._blockOffset++] = data[offset++];

	  // update length
	  for (var j = 0, carry = data.length * 8; carry > 0; ++j) {
	    this._length[j] += carry;
	    carry = (this._length[j] / 0x0100000000) | 0;
	    if (carry > 0) this._length[j] -= 0x0100000000 * carry;
	  }

	  return this
	};

	HashBase.prototype._update = function () {
	  throw new Error('_update is not implemented')
	};

	HashBase.prototype.digest = function (encoding) {
	  if (this._finalized) throw new Error('Digest already called')
	  this._finalized = true;

	  var digest = this._digest();
	  if (encoding !== undefined) digest = digest.toString(encoding);

	  // reset state
	  this._block.fill(0);
	  this._blockOffset = 0;
	  for (var i = 0; i < 4; ++i) this._length[i] = 0;

	  return digest
	};

	HashBase.prototype._digest = function () {
	  throw new Error('_digest is not implemented')
	};

	var hashBase = HashBase;

	var Buffer$2 = safeBuffer.Buffer;

	var ARRAY16 = new Array(16);

	function MD5 () {
	  hashBase.call(this, 64);

	  // state
	  this._a = 0x67452301;
	  this._b = 0xefcdab89;
	  this._c = 0x98badcfe;
	  this._d = 0x10325476;
	}

	inherits_browser(MD5, hashBase);

	MD5.prototype._update = function () {
	  var M = ARRAY16;
	  for (var i = 0; i < 16; ++i) M[i] = this._block.readInt32LE(i * 4);

	  var a = this._a;
	  var b = this._b;
	  var c = this._c;
	  var d = this._d;

	  a = fnF(a, b, c, d, M[0], 0xd76aa478, 7);
	  d = fnF(d, a, b, c, M[1], 0xe8c7b756, 12);
	  c = fnF(c, d, a, b, M[2], 0x242070db, 17);
	  b = fnF(b, c, d, a, M[3], 0xc1bdceee, 22);
	  a = fnF(a, b, c, d, M[4], 0xf57c0faf, 7);
	  d = fnF(d, a, b, c, M[5], 0x4787c62a, 12);
	  c = fnF(c, d, a, b, M[6], 0xa8304613, 17);
	  b = fnF(b, c, d, a, M[7], 0xfd469501, 22);
	  a = fnF(a, b, c, d, M[8], 0x698098d8, 7);
	  d = fnF(d, a, b, c, M[9], 0x8b44f7af, 12);
	  c = fnF(c, d, a, b, M[10], 0xffff5bb1, 17);
	  b = fnF(b, c, d, a, M[11], 0x895cd7be, 22);
	  a = fnF(a, b, c, d, M[12], 0x6b901122, 7);
	  d = fnF(d, a, b, c, M[13], 0xfd987193, 12);
	  c = fnF(c, d, a, b, M[14], 0xa679438e, 17);
	  b = fnF(b, c, d, a, M[15], 0x49b40821, 22);

	  a = fnG(a, b, c, d, M[1], 0xf61e2562, 5);
	  d = fnG(d, a, b, c, M[6], 0xc040b340, 9);
	  c = fnG(c, d, a, b, M[11], 0x265e5a51, 14);
	  b = fnG(b, c, d, a, M[0], 0xe9b6c7aa, 20);
	  a = fnG(a, b, c, d, M[5], 0xd62f105d, 5);
	  d = fnG(d, a, b, c, M[10], 0x02441453, 9);
	  c = fnG(c, d, a, b, M[15], 0xd8a1e681, 14);
	  b = fnG(b, c, d, a, M[4], 0xe7d3fbc8, 20);
	  a = fnG(a, b, c, d, M[9], 0x21e1cde6, 5);
	  d = fnG(d, a, b, c, M[14], 0xc33707d6, 9);
	  c = fnG(c, d, a, b, M[3], 0xf4d50d87, 14);
	  b = fnG(b, c, d, a, M[8], 0x455a14ed, 20);
	  a = fnG(a, b, c, d, M[13], 0xa9e3e905, 5);
	  d = fnG(d, a, b, c, M[2], 0xfcefa3f8, 9);
	  c = fnG(c, d, a, b, M[7], 0x676f02d9, 14);
	  b = fnG(b, c, d, a, M[12], 0x8d2a4c8a, 20);

	  a = fnH(a, b, c, d, M[5], 0xfffa3942, 4);
	  d = fnH(d, a, b, c, M[8], 0x8771f681, 11);
	  c = fnH(c, d, a, b, M[11], 0x6d9d6122, 16);
	  b = fnH(b, c, d, a, M[14], 0xfde5380c, 23);
	  a = fnH(a, b, c, d, M[1], 0xa4beea44, 4);
	  d = fnH(d, a, b, c, M[4], 0x4bdecfa9, 11);
	  c = fnH(c, d, a, b, M[7], 0xf6bb4b60, 16);
	  b = fnH(b, c, d, a, M[10], 0xbebfbc70, 23);
	  a = fnH(a, b, c, d, M[13], 0x289b7ec6, 4);
	  d = fnH(d, a, b, c, M[0], 0xeaa127fa, 11);
	  c = fnH(c, d, a, b, M[3], 0xd4ef3085, 16);
	  b = fnH(b, c, d, a, M[6], 0x04881d05, 23);
	  a = fnH(a, b, c, d, M[9], 0xd9d4d039, 4);
	  d = fnH(d, a, b, c, M[12], 0xe6db99e5, 11);
	  c = fnH(c, d, a, b, M[15], 0x1fa27cf8, 16);
	  b = fnH(b, c, d, a, M[2], 0xc4ac5665, 23);

	  a = fnI(a, b, c, d, M[0], 0xf4292244, 6);
	  d = fnI(d, a, b, c, M[7], 0x432aff97, 10);
	  c = fnI(c, d, a, b, M[14], 0xab9423a7, 15);
	  b = fnI(b, c, d, a, M[5], 0xfc93a039, 21);
	  a = fnI(a, b, c, d, M[12], 0x655b59c3, 6);
	  d = fnI(d, a, b, c, M[3], 0x8f0ccc92, 10);
	  c = fnI(c, d, a, b, M[10], 0xffeff47d, 15);
	  b = fnI(b, c, d, a, M[1], 0x85845dd1, 21);
	  a = fnI(a, b, c, d, M[8], 0x6fa87e4f, 6);
	  d = fnI(d, a, b, c, M[15], 0xfe2ce6e0, 10);
	  c = fnI(c, d, a, b, M[6], 0xa3014314, 15);
	  b = fnI(b, c, d, a, M[13], 0x4e0811a1, 21);
	  a = fnI(a, b, c, d, M[4], 0xf7537e82, 6);
	  d = fnI(d, a, b, c, M[11], 0xbd3af235, 10);
	  c = fnI(c, d, a, b, M[2], 0x2ad7d2bb, 15);
	  b = fnI(b, c, d, a, M[9], 0xeb86d391, 21);

	  this._a = (this._a + a) | 0;
	  this._b = (this._b + b) | 0;
	  this._c = (this._c + c) | 0;
	  this._d = (this._d + d) | 0;
	};

	MD5.prototype._digest = function () {
	  // create padding and handle blocks
	  this._block[this._blockOffset++] = 0x80;
	  if (this._blockOffset > 56) {
	    this._block.fill(0, this._blockOffset, 64);
	    this._update();
	    this._blockOffset = 0;
	  }

	  this._block.fill(0, this._blockOffset, 56);
	  this._block.writeUInt32LE(this._length[0], 56);
	  this._block.writeUInt32LE(this._length[1], 60);
	  this._update();

	  // produce result
	  var buffer = Buffer$2.allocUnsafe(16);
	  buffer.writeInt32LE(this._a, 0);
	  buffer.writeInt32LE(this._b, 4);
	  buffer.writeInt32LE(this._c, 8);
	  buffer.writeInt32LE(this._d, 12);
	  return buffer
	};

	function rotl (x, n) {
	  return (x << n) | (x >>> (32 - n))
	}

	function fnF (a, b, c, d, m, k, s) {
	  return (rotl((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + b) | 0
	}

	function fnG (a, b, c, d, m, k, s) {
	  return (rotl((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + b) | 0
	}

	function fnH (a, b, c, d, m, k, s) {
	  return (rotl((a + (b ^ c ^ d) + m + k) | 0, s) + b) | 0
	}

	function fnI (a, b, c, d, m, k, s) {
	  return (rotl((a + ((c ^ (b | (~d)))) + m + k) | 0, s) + b) | 0
	}

	var md5_js = MD5;

	var Buffer$3 = buffer.Buffer;



	var ARRAY16$1 = new Array(16);

	var zl = [
	  0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15,
	  7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5, 2, 14, 11, 8,
	  3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12,
	  1, 9, 11, 10, 0, 8, 12, 4, 13, 3, 7, 15, 14, 5, 6, 2,
	  4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
	];

	var zr = [
	  5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12,
	  6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8, 12, 4, 9, 1, 2,
	  15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13,
	  8, 6, 4, 1, 3, 11, 15, 0, 5, 12, 2, 13, 9, 7, 10, 14,
	  12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
	];

	var sl = [
	  11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8,
	  7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15, 9, 11, 7, 13, 12,
	  11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5,
	  11, 12, 14, 15, 14, 15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12,
	  9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
	];

	var sr = [
	  8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6,
	  9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12, 7, 6, 15, 13, 11,
	  9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5,
	  15, 5, 8, 11, 14, 14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8,
	  8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
	];

	var hl = [0x00000000, 0x5a827999, 0x6ed9eba1, 0x8f1bbcdc, 0xa953fd4e];
	var hr = [0x50a28be6, 0x5c4dd124, 0x6d703ef3, 0x7a6d76e9, 0x00000000];

	function RIPEMD160 () {
	  hashBase.call(this, 64);

	  // state
	  this._a = 0x67452301;
	  this._b = 0xefcdab89;
	  this._c = 0x98badcfe;
	  this._d = 0x10325476;
	  this._e = 0xc3d2e1f0;
	}

	inherits_browser(RIPEMD160, hashBase);

	RIPEMD160.prototype._update = function () {
	  var words = ARRAY16$1;
	  for (var j = 0; j < 16; ++j) words[j] = this._block.readInt32LE(j * 4);

	  var al = this._a | 0;
	  var bl = this._b | 0;
	  var cl = this._c | 0;
	  var dl = this._d | 0;
	  var el = this._e | 0;

	  var ar = this._a | 0;
	  var br = this._b | 0;
	  var cr = this._c | 0;
	  var dr = this._d | 0;
	  var er = this._e | 0;

	  // computation
	  for (var i = 0; i < 80; i += 1) {
	    var tl;
	    var tr;
	    if (i < 16) {
	      tl = fn1(al, bl, cl, dl, el, words[zl[i]], hl[0], sl[i]);
	      tr = fn5(ar, br, cr, dr, er, words[zr[i]], hr[0], sr[i]);
	    } else if (i < 32) {
	      tl = fn2(al, bl, cl, dl, el, words[zl[i]], hl[1], sl[i]);
	      tr = fn4(ar, br, cr, dr, er, words[zr[i]], hr[1], sr[i]);
	    } else if (i < 48) {
	      tl = fn3(al, bl, cl, dl, el, words[zl[i]], hl[2], sl[i]);
	      tr = fn3(ar, br, cr, dr, er, words[zr[i]], hr[2], sr[i]);
	    } else if (i < 64) {
	      tl = fn4(al, bl, cl, dl, el, words[zl[i]], hl[3], sl[i]);
	      tr = fn2(ar, br, cr, dr, er, words[zr[i]], hr[3], sr[i]);
	    } else { // if (i<80) {
	      tl = fn5(al, bl, cl, dl, el, words[zl[i]], hl[4], sl[i]);
	      tr = fn1(ar, br, cr, dr, er, words[zr[i]], hr[4], sr[i]);
	    }

	    al = el;
	    el = dl;
	    dl = rotl$1(cl, 10);
	    cl = bl;
	    bl = tl;

	    ar = er;
	    er = dr;
	    dr = rotl$1(cr, 10);
	    cr = br;
	    br = tr;
	  }

	  // update state
	  var t = (this._b + cl + dr) | 0;
	  this._b = (this._c + dl + er) | 0;
	  this._c = (this._d + el + ar) | 0;
	  this._d = (this._e + al + br) | 0;
	  this._e = (this._a + bl + cr) | 0;
	  this._a = t;
	};

	RIPEMD160.prototype._digest = function () {
	  // create padding and handle blocks
	  this._block[this._blockOffset++] = 0x80;
	  if (this._blockOffset > 56) {
	    this._block.fill(0, this._blockOffset, 64);
	    this._update();
	    this._blockOffset = 0;
	  }

	  this._block.fill(0, this._blockOffset, 56);
	  this._block.writeUInt32LE(this._length[0], 56);
	  this._block.writeUInt32LE(this._length[1], 60);
	  this._update();

	  // produce result
	  var buffer$$1 = Buffer$3.alloc ? Buffer$3.alloc(20) : new Buffer$3(20);
	  buffer$$1.writeInt32LE(this._a, 0);
	  buffer$$1.writeInt32LE(this._b, 4);
	  buffer$$1.writeInt32LE(this._c, 8);
	  buffer$$1.writeInt32LE(this._d, 12);
	  buffer$$1.writeInt32LE(this._e, 16);
	  return buffer$$1
	};

	function rotl$1 (x, n) {
	  return (x << n) | (x >>> (32 - n))
	}

	function fn1 (a, b, c, d, e, m, k, s) {
	  return (rotl$1((a + (b ^ c ^ d) + m + k) | 0, s) + e) | 0
	}

	function fn2 (a, b, c, d, e, m, k, s) {
	  return (rotl$1((a + ((b & c) | ((~b) & d)) + m + k) | 0, s) + e) | 0
	}

	function fn3 (a, b, c, d, e, m, k, s) {
	  return (rotl$1((a + ((b | (~c)) ^ d) + m + k) | 0, s) + e) | 0
	}

	function fn4 (a, b, c, d, e, m, k, s) {
	  return (rotl$1((a + ((b & d) | (c & (~d))) + m + k) | 0, s) + e) | 0
	}

	function fn5 (a, b, c, d, e, m, k, s) {
	  return (rotl$1((a + (b ^ (c | (~d))) + m + k) | 0, s) + e) | 0
	}

	var ripemd160 = RIPEMD160;

	var Buffer$4 = safeBuffer.Buffer;

	// prototype class for hash functions
	function Hash (blockSize, finalSize) {
	  this._block = Buffer$4.alloc(blockSize);
	  this._finalSize = finalSize;
	  this._blockSize = blockSize;
	  this._len = 0;
	}

	Hash.prototype.update = function (data, enc) {
	  if (typeof data === 'string') {
	    enc = enc || 'utf8';
	    data = Buffer$4.from(data, enc);
	  }

	  var block = this._block;
	  var blockSize = this._blockSize;
	  var length = data.length;
	  var accum = this._len;

	  for (var offset = 0; offset < length;) {
	    var assigned = accum % blockSize;
	    var remainder = Math.min(length - offset, blockSize - assigned);

	    for (var i = 0; i < remainder; i++) {
	      block[assigned + i] = data[offset + i];
	    }

	    accum += remainder;
	    offset += remainder;

	    if ((accum % blockSize) === 0) {
	      this._update(block);
	    }
	  }

	  this._len += length;
	  return this
	};

	Hash.prototype.digest = function (enc) {
	  var rem = this._len % this._blockSize;

	  this._block[rem] = 0x80;

	  // zero (rem + 1) trailing bits, where (rem + 1) is the smallest
	  // non-negative solution to the equation (length + 1 + (rem + 1)) === finalSize mod blockSize
	  this._block.fill(0, rem + 1);

	  if (rem >= this._finalSize) {
	    this._update(this._block);
	    this._block.fill(0);
	  }

	  var bits = this._len * 8;

	  // uint32
	  if (bits <= 0xffffffff) {
	    this._block.writeUInt32BE(bits, this._blockSize - 4);

	  // uint64
	  } else {
	    var lowBits = (bits & 0xffffffff) >>> 0;
	    var highBits = (bits - lowBits) / 0x100000000;

	    this._block.writeUInt32BE(highBits, this._blockSize - 8);
	    this._block.writeUInt32BE(lowBits, this._blockSize - 4);
	  }

	  this._update(this._block);
	  var hash = this._hash();

	  return enc ? hash.toString(enc) : hash
	};

	Hash.prototype._update = function () {
	  throw new Error('_update must be implemented by subclass')
	};

	var hash = Hash;

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-0, as defined
	 * in FIPS PUB 180-1
	 * This source code is derived from sha1.js of the same repository.
	 * The difference between SHA-0 and SHA-1 is just a bitwise rotate left
	 * operation was added.
	 */



	var Buffer$5 = safeBuffer.Buffer;

	var K = [
	  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
	];

	var W = new Array(80);

	function Sha () {
	  this.init();
	  this._w = W;

	  hash.call(this, 64, 56);
	}

	inherits_browser(Sha, hash);

	Sha.prototype.init = function () {
	  this._a = 0x67452301;
	  this._b = 0xefcdab89;
	  this._c = 0x98badcfe;
	  this._d = 0x10325476;
	  this._e = 0xc3d2e1f0;

	  return this
	};

	function rotl5 (num) {
	  return (num << 5) | (num >>> 27)
	}

	function rotl30 (num) {
	  return (num << 30) | (num >>> 2)
	}

	function ft (s, b, c, d) {
	  if (s === 0) return (b & c) | ((~b) & d)
	  if (s === 2) return (b & c) | (b & d) | (c & d)
	  return b ^ c ^ d
	}

	Sha.prototype._update = function (M) {
	  var W = this._w;

	  var a = this._a | 0;
	  var b = this._b | 0;
	  var c = this._c | 0;
	  var d = this._d | 0;
	  var e = this._e | 0;

	  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
	  for (; i < 80; ++i) W[i] = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];

	  for (var j = 0; j < 80; ++j) {
	    var s = ~~(j / 20);
	    var t = (rotl5(a) + ft(s, b, c, d) + e + W[j] + K[s]) | 0;

	    e = d;
	    d = c;
	    c = rotl30(b);
	    b = a;
	    a = t;
	  }

	  this._a = (a + this._a) | 0;
	  this._b = (b + this._b) | 0;
	  this._c = (c + this._c) | 0;
	  this._d = (d + this._d) | 0;
	  this._e = (e + this._e) | 0;
	};

	Sha.prototype._hash = function () {
	  var H = Buffer$5.allocUnsafe(20);

	  H.writeInt32BE(this._a | 0, 0);
	  H.writeInt32BE(this._b | 0, 4);
	  H.writeInt32BE(this._c | 0, 8);
	  H.writeInt32BE(this._d | 0, 12);
	  H.writeInt32BE(this._e | 0, 16);

	  return H
	};

	var sha = Sha;

	/*
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-1, as defined
	 * in FIPS PUB 180-1
	 * Version 2.1a Copyright Paul Johnston 2000 - 2002.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 * Distributed under the BSD License
	 * See http://pajhome.org.uk/crypt/md5 for details.
	 */



	var Buffer$6 = safeBuffer.Buffer;

	var K$1 = [
	  0x5a827999, 0x6ed9eba1, 0x8f1bbcdc | 0, 0xca62c1d6 | 0
	];

	var W$1 = new Array(80);

	function Sha1 () {
	  this.init();
	  this._w = W$1;

	  hash.call(this, 64, 56);
	}

	inherits_browser(Sha1, hash);

	Sha1.prototype.init = function () {
	  this._a = 0x67452301;
	  this._b = 0xefcdab89;
	  this._c = 0x98badcfe;
	  this._d = 0x10325476;
	  this._e = 0xc3d2e1f0;

	  return this
	};

	function rotl1 (num) {
	  return (num << 1) | (num >>> 31)
	}

	function rotl5$1 (num) {
	  return (num << 5) | (num >>> 27)
	}

	function rotl30$1 (num) {
	  return (num << 30) | (num >>> 2)
	}

	function ft$1 (s, b, c, d) {
	  if (s === 0) return (b & c) | ((~b) & d)
	  if (s === 2) return (b & c) | (b & d) | (c & d)
	  return b ^ c ^ d
	}

	Sha1.prototype._update = function (M) {
	  var W = this._w;

	  var a = this._a | 0;
	  var b = this._b | 0;
	  var c = this._c | 0;
	  var d = this._d | 0;
	  var e = this._e | 0;

	  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
	  for (; i < 80; ++i) W[i] = rotl1(W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16]);

	  for (var j = 0; j < 80; ++j) {
	    var s = ~~(j / 20);
	    var t = (rotl5$1(a) + ft$1(s, b, c, d) + e + W[j] + K$1[s]) | 0;

	    e = d;
	    d = c;
	    c = rotl30$1(b);
	    b = a;
	    a = t;
	  }

	  this._a = (a + this._a) | 0;
	  this._b = (b + this._b) | 0;
	  this._c = (c + this._c) | 0;
	  this._d = (d + this._d) | 0;
	  this._e = (e + this._e) | 0;
	};

	Sha1.prototype._hash = function () {
	  var H = Buffer$6.allocUnsafe(20);

	  H.writeInt32BE(this._a | 0, 0);
	  H.writeInt32BE(this._b | 0, 4);
	  H.writeInt32BE(this._c | 0, 8);
	  H.writeInt32BE(this._d | 0, 12);
	  H.writeInt32BE(this._e | 0, 16);

	  return H
	};

	var sha1 = Sha1;

	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */



	var Buffer$7 = safeBuffer.Buffer;

	var K$2 = [
	  0x428A2F98, 0x71374491, 0xB5C0FBCF, 0xE9B5DBA5,
	  0x3956C25B, 0x59F111F1, 0x923F82A4, 0xAB1C5ED5,
	  0xD807AA98, 0x12835B01, 0x243185BE, 0x550C7DC3,
	  0x72BE5D74, 0x80DEB1FE, 0x9BDC06A7, 0xC19BF174,
	  0xE49B69C1, 0xEFBE4786, 0x0FC19DC6, 0x240CA1CC,
	  0x2DE92C6F, 0x4A7484AA, 0x5CB0A9DC, 0x76F988DA,
	  0x983E5152, 0xA831C66D, 0xB00327C8, 0xBF597FC7,
	  0xC6E00BF3, 0xD5A79147, 0x06CA6351, 0x14292967,
	  0x27B70A85, 0x2E1B2138, 0x4D2C6DFC, 0x53380D13,
	  0x650A7354, 0x766A0ABB, 0x81C2C92E, 0x92722C85,
	  0xA2BFE8A1, 0xA81A664B, 0xC24B8B70, 0xC76C51A3,
	  0xD192E819, 0xD6990624, 0xF40E3585, 0x106AA070,
	  0x19A4C116, 0x1E376C08, 0x2748774C, 0x34B0BCB5,
	  0x391C0CB3, 0x4ED8AA4A, 0x5B9CCA4F, 0x682E6FF3,
	  0x748F82EE, 0x78A5636F, 0x84C87814, 0x8CC70208,
	  0x90BEFFFA, 0xA4506CEB, 0xBEF9A3F7, 0xC67178F2
	];

	var W$2 = new Array(64);

	function Sha256 () {
	  this.init();

	  this._w = W$2; // new Array(64)

	  hash.call(this, 64, 56);
	}

	inherits_browser(Sha256, hash);

	Sha256.prototype.init = function () {
	  this._a = 0x6a09e667;
	  this._b = 0xbb67ae85;
	  this._c = 0x3c6ef372;
	  this._d = 0xa54ff53a;
	  this._e = 0x510e527f;
	  this._f = 0x9b05688c;
	  this._g = 0x1f83d9ab;
	  this._h = 0x5be0cd19;

	  return this
	};

	function ch (x, y, z) {
	  return z ^ (x & (y ^ z))
	}

	function maj (x, y, z) {
	  return (x & y) | (z & (x | y))
	}

	function sigma0 (x) {
	  return (x >>> 2 | x << 30) ^ (x >>> 13 | x << 19) ^ (x >>> 22 | x << 10)
	}

	function sigma1 (x) {
	  return (x >>> 6 | x << 26) ^ (x >>> 11 | x << 21) ^ (x >>> 25 | x << 7)
	}

	function gamma0 (x) {
	  return (x >>> 7 | x << 25) ^ (x >>> 18 | x << 14) ^ (x >>> 3)
	}

	function gamma1 (x) {
	  return (x >>> 17 | x << 15) ^ (x >>> 19 | x << 13) ^ (x >>> 10)
	}

	Sha256.prototype._update = function (M) {
	  var W = this._w;

	  var a = this._a | 0;
	  var b = this._b | 0;
	  var c = this._c | 0;
	  var d = this._d | 0;
	  var e = this._e | 0;
	  var f = this._f | 0;
	  var g = this._g | 0;
	  var h = this._h | 0;

	  for (var i = 0; i < 16; ++i) W[i] = M.readInt32BE(i * 4);
	  for (; i < 64; ++i) W[i] = (gamma1(W[i - 2]) + W[i - 7] + gamma0(W[i - 15]) + W[i - 16]) | 0;

	  for (var j = 0; j < 64; ++j) {
	    var T1 = (h + sigma1(e) + ch(e, f, g) + K$2[j] + W[j]) | 0;
	    var T2 = (sigma0(a) + maj(a, b, c)) | 0;

	    h = g;
	    g = f;
	    f = e;
	    e = (d + T1) | 0;
	    d = c;
	    c = b;
	    b = a;
	    a = (T1 + T2) | 0;
	  }

	  this._a = (a + this._a) | 0;
	  this._b = (b + this._b) | 0;
	  this._c = (c + this._c) | 0;
	  this._d = (d + this._d) | 0;
	  this._e = (e + this._e) | 0;
	  this._f = (f + this._f) | 0;
	  this._g = (g + this._g) | 0;
	  this._h = (h + this._h) | 0;
	};

	Sha256.prototype._hash = function () {
	  var H = Buffer$7.allocUnsafe(32);

	  H.writeInt32BE(this._a, 0);
	  H.writeInt32BE(this._b, 4);
	  H.writeInt32BE(this._c, 8);
	  H.writeInt32BE(this._d, 12);
	  H.writeInt32BE(this._e, 16);
	  H.writeInt32BE(this._f, 20);
	  H.writeInt32BE(this._g, 24);
	  H.writeInt32BE(this._h, 28);

	  return H
	};

	var sha256 = Sha256;

	/**
	 * A JavaScript implementation of the Secure Hash Algorithm, SHA-256, as defined
	 * in FIPS 180-2
	 * Version 2.2-beta Copyright Angel Marin, Paul Johnston 2000 - 2009.
	 * Other contributors: Greg Holt, Andrew Kepert, Ydnar, Lostinet
	 *
	 */




	var Buffer$8 = safeBuffer.Buffer;

	var W$3 = new Array(64);

	function Sha224 () {
	  this.init();

	  this._w = W$3; // new Array(64)

	  hash.call(this, 64, 56);
	}

	inherits_browser(Sha224, sha256);

	Sha224.prototype.init = function () {
	  this._a = 0xc1059ed8;
	  this._b = 0x367cd507;
	  this._c = 0x3070dd17;
	  this._d = 0xf70e5939;
	  this._e = 0xffc00b31;
	  this._f = 0x68581511;
	  this._g = 0x64f98fa7;
	  this._h = 0xbefa4fa4;

	  return this
	};

	Sha224.prototype._hash = function () {
	  var H = Buffer$8.allocUnsafe(28);

	  H.writeInt32BE(this._a, 0);
	  H.writeInt32BE(this._b, 4);
	  H.writeInt32BE(this._c, 8);
	  H.writeInt32BE(this._d, 12);
	  H.writeInt32BE(this._e, 16);
	  H.writeInt32BE(this._f, 20);
	  H.writeInt32BE(this._g, 24);

	  return H
	};

	var sha224 = Sha224;

	var Buffer$9 = safeBuffer.Buffer;

	var K$3 = [
	  0x428a2f98, 0xd728ae22, 0x71374491, 0x23ef65cd,
	  0xb5c0fbcf, 0xec4d3b2f, 0xe9b5dba5, 0x8189dbbc,
	  0x3956c25b, 0xf348b538, 0x59f111f1, 0xb605d019,
	  0x923f82a4, 0xaf194f9b, 0xab1c5ed5, 0xda6d8118,
	  0xd807aa98, 0xa3030242, 0x12835b01, 0x45706fbe,
	  0x243185be, 0x4ee4b28c, 0x550c7dc3, 0xd5ffb4e2,
	  0x72be5d74, 0xf27b896f, 0x80deb1fe, 0x3b1696b1,
	  0x9bdc06a7, 0x25c71235, 0xc19bf174, 0xcf692694,
	  0xe49b69c1, 0x9ef14ad2, 0xefbe4786, 0x384f25e3,
	  0x0fc19dc6, 0x8b8cd5b5, 0x240ca1cc, 0x77ac9c65,
	  0x2de92c6f, 0x592b0275, 0x4a7484aa, 0x6ea6e483,
	  0x5cb0a9dc, 0xbd41fbd4, 0x76f988da, 0x831153b5,
	  0x983e5152, 0xee66dfab, 0xa831c66d, 0x2db43210,
	  0xb00327c8, 0x98fb213f, 0xbf597fc7, 0xbeef0ee4,
	  0xc6e00bf3, 0x3da88fc2, 0xd5a79147, 0x930aa725,
	  0x06ca6351, 0xe003826f, 0x14292967, 0x0a0e6e70,
	  0x27b70a85, 0x46d22ffc, 0x2e1b2138, 0x5c26c926,
	  0x4d2c6dfc, 0x5ac42aed, 0x53380d13, 0x9d95b3df,
	  0x650a7354, 0x8baf63de, 0x766a0abb, 0x3c77b2a8,
	  0x81c2c92e, 0x47edaee6, 0x92722c85, 0x1482353b,
	  0xa2bfe8a1, 0x4cf10364, 0xa81a664b, 0xbc423001,
	  0xc24b8b70, 0xd0f89791, 0xc76c51a3, 0x0654be30,
	  0xd192e819, 0xd6ef5218, 0xd6990624, 0x5565a910,
	  0xf40e3585, 0x5771202a, 0x106aa070, 0x32bbd1b8,
	  0x19a4c116, 0xb8d2d0c8, 0x1e376c08, 0x5141ab53,
	  0x2748774c, 0xdf8eeb99, 0x34b0bcb5, 0xe19b48a8,
	  0x391c0cb3, 0xc5c95a63, 0x4ed8aa4a, 0xe3418acb,
	  0x5b9cca4f, 0x7763e373, 0x682e6ff3, 0xd6b2b8a3,
	  0x748f82ee, 0x5defb2fc, 0x78a5636f, 0x43172f60,
	  0x84c87814, 0xa1f0ab72, 0x8cc70208, 0x1a6439ec,
	  0x90befffa, 0x23631e28, 0xa4506ceb, 0xde82bde9,
	  0xbef9a3f7, 0xb2c67915, 0xc67178f2, 0xe372532b,
	  0xca273ece, 0xea26619c, 0xd186b8c7, 0x21c0c207,
	  0xeada7dd6, 0xcde0eb1e, 0xf57d4f7f, 0xee6ed178,
	  0x06f067aa, 0x72176fba, 0x0a637dc5, 0xa2c898a6,
	  0x113f9804, 0xbef90dae, 0x1b710b35, 0x131c471b,
	  0x28db77f5, 0x23047d84, 0x32caab7b, 0x40c72493,
	  0x3c9ebe0a, 0x15c9bebc, 0x431d67c4, 0x9c100d4c,
	  0x4cc5d4be, 0xcb3e42b6, 0x597f299c, 0xfc657e2a,
	  0x5fcb6fab, 0x3ad6faec, 0x6c44198c, 0x4a475817
	];

	var W$4 = new Array(160);

	function Sha512 () {
	  this.init();
	  this._w = W$4;

	  hash.call(this, 128, 112);
	}

	inherits_browser(Sha512, hash);

	Sha512.prototype.init = function () {
	  this._ah = 0x6a09e667;
	  this._bh = 0xbb67ae85;
	  this._ch = 0x3c6ef372;
	  this._dh = 0xa54ff53a;
	  this._eh = 0x510e527f;
	  this._fh = 0x9b05688c;
	  this._gh = 0x1f83d9ab;
	  this._hh = 0x5be0cd19;

	  this._al = 0xf3bcc908;
	  this._bl = 0x84caa73b;
	  this._cl = 0xfe94f82b;
	  this._dl = 0x5f1d36f1;
	  this._el = 0xade682d1;
	  this._fl = 0x2b3e6c1f;
	  this._gl = 0xfb41bd6b;
	  this._hl = 0x137e2179;

	  return this
	};

	function Ch (x, y, z) {
	  return z ^ (x & (y ^ z))
	}

	function maj$1 (x, y, z) {
	  return (x & y) | (z & (x | y))
	}

	function sigma0$1 (x, xl) {
	  return (x >>> 28 | xl << 4) ^ (xl >>> 2 | x << 30) ^ (xl >>> 7 | x << 25)
	}

	function sigma1$1 (x, xl) {
	  return (x >>> 14 | xl << 18) ^ (x >>> 18 | xl << 14) ^ (xl >>> 9 | x << 23)
	}

	function Gamma0 (x, xl) {
	  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7)
	}

	function Gamma0l (x, xl) {
	  return (x >>> 1 | xl << 31) ^ (x >>> 8 | xl << 24) ^ (x >>> 7 | xl << 25)
	}

	function Gamma1 (x, xl) {
	  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6)
	}

	function Gamma1l (x, xl) {
	  return (x >>> 19 | xl << 13) ^ (xl >>> 29 | x << 3) ^ (x >>> 6 | xl << 26)
	}

	function getCarry (a, b) {
	  return (a >>> 0) < (b >>> 0) ? 1 : 0
	}

	Sha512.prototype._update = function (M) {
	  var W = this._w;

	  var ah = this._ah | 0;
	  var bh = this._bh | 0;
	  var ch = this._ch | 0;
	  var dh = this._dh | 0;
	  var eh = this._eh | 0;
	  var fh = this._fh | 0;
	  var gh = this._gh | 0;
	  var hh = this._hh | 0;

	  var al = this._al | 0;
	  var bl = this._bl | 0;
	  var cl = this._cl | 0;
	  var dl = this._dl | 0;
	  var el = this._el | 0;
	  var fl = this._fl | 0;
	  var gl = this._gl | 0;
	  var hl = this._hl | 0;

	  for (var i = 0; i < 32; i += 2) {
	    W[i] = M.readInt32BE(i * 4);
	    W[i + 1] = M.readInt32BE(i * 4 + 4);
	  }
	  for (; i < 160; i += 2) {
	    var xh = W[i - 15 * 2];
	    var xl = W[i - 15 * 2 + 1];
	    var gamma0 = Gamma0(xh, xl);
	    var gamma0l = Gamma0l(xl, xh);

	    xh = W[i - 2 * 2];
	    xl = W[i - 2 * 2 + 1];
	    var gamma1 = Gamma1(xh, xl);
	    var gamma1l = Gamma1l(xl, xh);

	    // W[i] = gamma0 + W[i - 7] + gamma1 + W[i - 16]
	    var Wi7h = W[i - 7 * 2];
	    var Wi7l = W[i - 7 * 2 + 1];

	    var Wi16h = W[i - 16 * 2];
	    var Wi16l = W[i - 16 * 2 + 1];

	    var Wil = (gamma0l + Wi7l) | 0;
	    var Wih = (gamma0 + Wi7h + getCarry(Wil, gamma0l)) | 0;
	    Wil = (Wil + gamma1l) | 0;
	    Wih = (Wih + gamma1 + getCarry(Wil, gamma1l)) | 0;
	    Wil = (Wil + Wi16l) | 0;
	    Wih = (Wih + Wi16h + getCarry(Wil, Wi16l)) | 0;

	    W[i] = Wih;
	    W[i + 1] = Wil;
	  }

	  for (var j = 0; j < 160; j += 2) {
	    Wih = W[j];
	    Wil = W[j + 1];

	    var majh = maj$1(ah, bh, ch);
	    var majl = maj$1(al, bl, cl);

	    var sigma0h = sigma0$1(ah, al);
	    var sigma0l = sigma0$1(al, ah);
	    var sigma1h = sigma1$1(eh, el);
	    var sigma1l = sigma1$1(el, eh);

	    // t1 = h + sigma1 + ch + K[j] + W[j]
	    var Kih = K$3[j];
	    var Kil = K$3[j + 1];

	    var chh = Ch(eh, fh, gh);
	    var chl = Ch(el, fl, gl);

	    var t1l = (hl + sigma1l) | 0;
	    var t1h = (hh + sigma1h + getCarry(t1l, hl)) | 0;
	    t1l = (t1l + chl) | 0;
	    t1h = (t1h + chh + getCarry(t1l, chl)) | 0;
	    t1l = (t1l + Kil) | 0;
	    t1h = (t1h + Kih + getCarry(t1l, Kil)) | 0;
	    t1l = (t1l + Wil) | 0;
	    t1h = (t1h + Wih + getCarry(t1l, Wil)) | 0;

	    // t2 = sigma0 + maj
	    var t2l = (sigma0l + majl) | 0;
	    var t2h = (sigma0h + majh + getCarry(t2l, sigma0l)) | 0;

	    hh = gh;
	    hl = gl;
	    gh = fh;
	    gl = fl;
	    fh = eh;
	    fl = el;
	    el = (dl + t1l) | 0;
	    eh = (dh + t1h + getCarry(el, dl)) | 0;
	    dh = ch;
	    dl = cl;
	    ch = bh;
	    cl = bl;
	    bh = ah;
	    bl = al;
	    al = (t1l + t2l) | 0;
	    ah = (t1h + t2h + getCarry(al, t1l)) | 0;
	  }

	  this._al = (this._al + al) | 0;
	  this._bl = (this._bl + bl) | 0;
	  this._cl = (this._cl + cl) | 0;
	  this._dl = (this._dl + dl) | 0;
	  this._el = (this._el + el) | 0;
	  this._fl = (this._fl + fl) | 0;
	  this._gl = (this._gl + gl) | 0;
	  this._hl = (this._hl + hl) | 0;

	  this._ah = (this._ah + ah + getCarry(this._al, al)) | 0;
	  this._bh = (this._bh + bh + getCarry(this._bl, bl)) | 0;
	  this._ch = (this._ch + ch + getCarry(this._cl, cl)) | 0;
	  this._dh = (this._dh + dh + getCarry(this._dl, dl)) | 0;
	  this._eh = (this._eh + eh + getCarry(this._el, el)) | 0;
	  this._fh = (this._fh + fh + getCarry(this._fl, fl)) | 0;
	  this._gh = (this._gh + gh + getCarry(this._gl, gl)) | 0;
	  this._hh = (this._hh + hh + getCarry(this._hl, hl)) | 0;
	};

	Sha512.prototype._hash = function () {
	  var H = Buffer$9.allocUnsafe(64);

	  function writeInt64BE (h, l, offset) {
	    H.writeInt32BE(h, offset);
	    H.writeInt32BE(l, offset + 4);
	  }

	  writeInt64BE(this._ah, this._al, 0);
	  writeInt64BE(this._bh, this._bl, 8);
	  writeInt64BE(this._ch, this._cl, 16);
	  writeInt64BE(this._dh, this._dl, 24);
	  writeInt64BE(this._eh, this._el, 32);
	  writeInt64BE(this._fh, this._fl, 40);
	  writeInt64BE(this._gh, this._gl, 48);
	  writeInt64BE(this._hh, this._hl, 56);

	  return H
	};

	var sha512 = Sha512;

	var Buffer$a = safeBuffer.Buffer;

	var W$5 = new Array(160);

	function Sha384 () {
	  this.init();
	  this._w = W$5;

	  hash.call(this, 128, 112);
	}

	inherits_browser(Sha384, sha512);

	Sha384.prototype.init = function () {
	  this._ah = 0xcbbb9d5d;
	  this._bh = 0x629a292a;
	  this._ch = 0x9159015a;
	  this._dh = 0x152fecd8;
	  this._eh = 0x67332667;
	  this._fh = 0x8eb44a87;
	  this._gh = 0xdb0c2e0d;
	  this._hh = 0x47b5481d;

	  this._al = 0xc1059ed8;
	  this._bl = 0x367cd507;
	  this._cl = 0x3070dd17;
	  this._dl = 0xf70e5939;
	  this._el = 0xffc00b31;
	  this._fl = 0x68581511;
	  this._gl = 0x64f98fa7;
	  this._hl = 0xbefa4fa4;

	  return this
	};

	Sha384.prototype._hash = function () {
	  var H = Buffer$a.allocUnsafe(48);

	  function writeInt64BE (h, l, offset) {
	    H.writeInt32BE(h, offset);
	    H.writeInt32BE(l, offset + 4);
	  }

	  writeInt64BE(this._ah, this._al, 0);
	  writeInt64BE(this._bh, this._bl, 8);
	  writeInt64BE(this._ch, this._cl, 16);
	  writeInt64BE(this._dh, this._dl, 24);
	  writeInt64BE(this._eh, this._el, 32);
	  writeInt64BE(this._fh, this._fl, 40);

	  return H
	};

	var sha384 = Sha384;

	var sha_js = createCommonjsModule(function (module) {
	var exports = module.exports = function SHA (algorithm) {
	  algorithm = algorithm.toLowerCase();

	  var Algorithm = exports[algorithm];
	  if (!Algorithm) throw new Error(algorithm + ' is not supported (we accept pull requests)')

	  return new Algorithm()
	};

	exports.sha = sha;
	exports.sha1 = sha1;
	exports.sha224 = sha224;
	exports.sha256 = sha256;
	exports.sha384 = sha384;
	exports.sha512 = sha512;
	});

	var Buffer$b = safeBuffer.Buffer;
	var Transform$2 = Stream.Transform;
	var StringDecoder$1 = stringDecoder.StringDecoder;


	function CipherBase (hashMode) {
	  Transform$2.call(this);
	  this.hashMode = typeof hashMode === 'string';
	  if (this.hashMode) {
	    this[hashMode] = this._finalOrDigest;
	  } else {
	    this.final = this._finalOrDigest;
	  }
	  if (this._final) {
	    this.__final = this._final;
	    this._final = null;
	  }
	  this._decoder = null;
	  this._encoding = null;
	}
	inherits_browser(CipherBase, Transform$2);

	CipherBase.prototype.update = function (data, inputEnc, outputEnc) {
	  if (typeof data === 'string') {
	    data = Buffer$b.from(data, inputEnc);
	  }

	  var outData = this._update(data);
	  if (this.hashMode) return this

	  if (outputEnc) {
	    outData = this._toString(outData, outputEnc);
	  }

	  return outData
	};

	CipherBase.prototype.setAutoPadding = function () {};
	CipherBase.prototype.getAuthTag = function () {
	  throw new Error('trying to get auth tag in unsupported state')
	};

	CipherBase.prototype.setAuthTag = function () {
	  throw new Error('trying to set auth tag in unsupported state')
	};

	CipherBase.prototype.setAAD = function () {
	  throw new Error('trying to set aad in unsupported state')
	};

	CipherBase.prototype._transform = function (data, _, next) {
	  var err;
	  try {
	    if (this.hashMode) {
	      this._update(data);
	    } else {
	      this.push(this._update(data));
	    }
	  } catch (e) {
	    err = e;
	  } finally {
	    next(err);
	  }
	};
	CipherBase.prototype._flush = function (done) {
	  var err;
	  try {
	    this.push(this.__final());
	  } catch (e) {
	    err = e;
	  }

	  done(err);
	};
	CipherBase.prototype._finalOrDigest = function (outputEnc) {
	  var outData = this.__final() || Buffer$b.alloc(0);
	  if (outputEnc) {
	    outData = this._toString(outData, outputEnc, true);
	  }
	  return outData
	};

	CipherBase.prototype._toString = function (value, enc, fin) {
	  if (!this._decoder) {
	    this._decoder = new StringDecoder$1(enc);
	    this._encoding = enc;
	  }

	  if (this._encoding !== enc) throw new Error('can\'t switch encodings')

	  var out = this._decoder.write(value);
	  if (fin) {
	    out += this._decoder.end();
	  }

	  return out
	};

	var cipherBase = CipherBase;

	function Hash$1 (hash) {
	  cipherBase.call(this, 'digest');

	  this._hash = hash;
	}

	inherits_browser(Hash$1, cipherBase);

	Hash$1.prototype._update = function (data) {
	  this._hash.update(data);
	};

	Hash$1.prototype._final = function () {
	  return this._hash.digest()
	};

	var browser$1 = function createHash (alg) {
	  alg = alg.toLowerCase();
	  if (alg === 'md5') return new md5_js()
	  if (alg === 'rmd160' || alg === 'ripemd160') return new ripemd160()

	  return new Hash$1(sha_js(alg))
	};

	var hasFetch = isFunction$1(global$1.fetch) && isFunction$1(global$1.ReadableStream);

	var _blobConstructor;
	function blobConstructor() {
	  if (typeof _blobConstructor !== 'undefined') {
	    return _blobConstructor;
	  }
	  try {
	    new global$1.Blob([new ArrayBuffer(1)]);
	    _blobConstructor = true;
	  } catch (e) {
	    _blobConstructor = false;
	  }
	  return _blobConstructor
	}
	var xhr;

	function checkTypeSupport(type) {
	  if (!xhr) {
	    xhr = new global$1.XMLHttpRequest();
	    // If location.host is empty, e.g. if this page/worker was loaded
	    // from a Blob, then use example.com to avoid an error
	    xhr.open('GET', global$1.location.host ? '/' : 'https://example.com');
	  }
	  try {
	    xhr.responseType = type;
	    return xhr.responseType === type
	  } catch (e) {
	    return false
	  }

	}

	// For some strange reason, Safari 7.0 reports typeof global.ArrayBuffer === 'object'.
	// Safari 7.1 appears to have fixed this bug.
	var haveArrayBuffer = typeof global$1.ArrayBuffer !== 'undefined';
	var haveSlice = haveArrayBuffer && isFunction$1(global$1.ArrayBuffer.prototype.slice);

	var arraybuffer = haveArrayBuffer && checkTypeSupport('arraybuffer');
	  // These next two tests unavoidably show warnings in Chrome. Since fetch will always
	  // be used if it's available, just return false for these to avoid the warnings.
	var msstream = !hasFetch && haveSlice && checkTypeSupport('ms-stream');
	var mozchunkedarraybuffer = !hasFetch && haveArrayBuffer &&
	  checkTypeSupport('moz-chunked-arraybuffer');
	var overrideMimeType = isFunction$1(xhr.overrideMimeType);
	var vbArray = isFunction$1(global$1.VBArray);

	function isFunction$1(value) {
	  return typeof value === 'function'
	}

	xhr = null; // Help gc

	var rStates = {
	  UNSENT: 0,
	  OPENED: 1,
	  HEADERS_RECEIVED: 2,
	  LOADING: 3,
	  DONE: 4
	};
	function IncomingMessage(xhr, response, mode) {
	  var self = this;
	  Readable.call(self);

	  self._mode = mode;
	  self.headers = {};
	  self.rawHeaders = [];
	  self.trailers = {};
	  self.rawTrailers = [];

	  // Fake the 'close' event, but only once 'end' fires
	  self.on('end', function() {
	    // The nextTick is necessary to prevent the 'request' module from causing an infinite loop
	    nextTick(function() {
	      self.emit('close');
	    });
	  });
	  var read;
	  if (mode === 'fetch') {
	    self._fetchResponse = response;

	    self.url = response.url;
	    self.statusCode = response.status;
	    self.statusMessage = response.statusText;
	      // backwards compatible version of for (<item> of <iterable>):
	      // for (var <item>,_i,_it = <iterable>[Symbol.iterator](); <item> = (_i = _it.next()).value,!_i.done;)
	    for (var header, _i, _it = response.headers[Symbol.iterator](); header = (_i = _it.next()).value, !_i.done;) {
	      self.headers[header[0].toLowerCase()] = header[1];
	      self.rawHeaders.push(header[0], header[1]);
	    }

	    // TODO: this doesn't respect backpressure. Once WritableStream is available, this can be fixed
	    var reader = response.body.getReader();

	    read = function () {
	      reader.read().then(function(result) {
	        if (self._destroyed)
	          return
	        if (result.done) {
	          self.push(null);
	          return
	        }
	        self.push(new Buffer(result.value));
	        read();
	      });
	    };
	    read();

	  } else {
	    self._xhr = xhr;
	    self._pos = 0;

	    self.url = xhr.responseURL;
	    self.statusCode = xhr.status;
	    self.statusMessage = xhr.statusText;
	    var headers = xhr.getAllResponseHeaders().split(/\r?\n/);
	    headers.forEach(function(header) {
	      var matches = header.match(/^([^:]+):\s*(.*)/);
	      if (matches) {
	        var key = matches[1].toLowerCase();
	        if (key === 'set-cookie') {
	          if (self.headers[key] === undefined) {
	            self.headers[key] = [];
	          }
	          self.headers[key].push(matches[2]);
	        } else if (self.headers[key] !== undefined) {
	          self.headers[key] += ', ' + matches[2];
	        } else {
	          self.headers[key] = matches[2];
	        }
	        self.rawHeaders.push(matches[1], matches[2]);
	      }
	    });

	    self._charset = 'x-user-defined';
	    if (!overrideMimeType) {
	      var mimeType = self.rawHeaders['mime-type'];
	      if (mimeType) {
	        var charsetMatch = mimeType.match(/;\s*charset=([^;])(;|$)/);
	        if (charsetMatch) {
	          self._charset = charsetMatch[1].toLowerCase();
	        }
	      }
	      if (!self._charset)
	        self._charset = 'utf-8'; // best guess
	    }
	  }
	}

	inherits$2(IncomingMessage, Readable);

	IncomingMessage.prototype._read = function() {};

	IncomingMessage.prototype._onXHRProgress = function() {
	  var self = this;

	  var xhr = self._xhr;

	  var response = null;
	  switch (self._mode) {
	  case 'text:vbarray': // For IE9
	    if (xhr.readyState !== rStates.DONE)
	      break
	    try {
	      // This fails in IE8
	      response = new global$1.VBArray(xhr.responseBody).toArray();
	    } catch (e) {
	      // pass
	    }
	    if (response !== null) {
	      self.push(new Buffer(response));
	      break
	    }
	    // Falls through in IE8
	  case 'text':
	    try { // This will fail when readyState = 3 in IE9. Switch mode and wait for readyState = 4
	      response = xhr.responseText;
	    } catch (e) {
	      self._mode = 'text:vbarray';
	      break
	    }
	    if (response.length > self._pos) {
	      var newData = response.substr(self._pos);
	      if (self._charset === 'x-user-defined') {
	        var buffer = new Buffer(newData.length);
	        for (var i = 0; i < newData.length; i++)
	          buffer[i] = newData.charCodeAt(i) & 0xff;

	        self.push(buffer);
	      } else {
	        self.push(newData, self._charset);
	      }
	      self._pos = response.length;
	    }
	    break
	  case 'arraybuffer':
	    if (xhr.readyState !== rStates.DONE || !xhr.response)
	      break
	    response = xhr.response;
	    self.push(new Buffer(new Uint8Array(response)));
	    break
	  case 'moz-chunked-arraybuffer': // take whole
	    response = xhr.response;
	    if (xhr.readyState !== rStates.LOADING || !response)
	      break
	    self.push(new Buffer(new Uint8Array(response)));
	    break
	  case 'ms-stream':
	    response = xhr.response;
	    if (xhr.readyState !== rStates.LOADING)
	      break
	    var reader = new global$1.MSStreamReader();
	    reader.onprogress = function() {
	      if (reader.result.byteLength > self._pos) {
	        self.push(new Buffer(new Uint8Array(reader.result.slice(self._pos))));
	        self._pos = reader.result.byteLength;
	      }
	    };
	    reader.onload = function() {
	      self.push(null);
	    };
	      // reader.onerror = ??? // TODO: this
	    reader.readAsArrayBuffer(response);
	    break
	  }

	  // The ms-stream case handles end separately in reader.onload()
	  if (self._xhr.readyState === rStates.DONE && self._mode !== 'ms-stream') {
	    self.push(null);
	  }
	};

	// from https://github.com/jhiesey/to-arraybuffer/blob/6502d9850e70ba7935a7df4ad86b358fc216f9f0/index.js
	function toArrayBuffer (buf) {
	  // If the buffer is backed by a Uint8Array, a faster version will work
	  if (buf instanceof Uint8Array) {
	    // If the buffer isn't a subarray, return the underlying ArrayBuffer
	    if (buf.byteOffset === 0 && buf.byteLength === buf.buffer.byteLength) {
	      return buf.buffer
	    } else if (typeof buf.buffer.slice === 'function') {
	      // Otherwise we need to get a proper copy
	      return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
	    }
	  }

	  if (isBuffer(buf)) {
	    // This is the slow version that will work with any Buffer
	    // implementation (even in old browsers)
	    var arrayCopy = new Uint8Array(buf.length);
	    var len = buf.length;
	    for (var i = 0; i < len; i++) {
	      arrayCopy[i] = buf[i];
	    }
	    return arrayCopy.buffer
	  } else {
	    throw new Error('Argument must be a Buffer')
	  }
	}

	function decideMode(preferBinary, useFetch) {
	  if (hasFetch && useFetch) {
	    return 'fetch'
	  } else if (mozchunkedarraybuffer) {
	    return 'moz-chunked-arraybuffer'
	  } else if (msstream) {
	    return 'ms-stream'
	  } else if (arraybuffer && preferBinary) {
	    return 'arraybuffer'
	  } else if (vbArray && preferBinary) {
	    return 'text:vbarray'
	  } else {
	    return 'text'
	  }
	}

	function ClientRequest(opts) {
	  var self = this;
	  Writable.call(self);

	  self._opts = opts;
	  self._body = [];
	  self._headers = {};
	  if (opts.auth)
	    self.setHeader('Authorization', 'Basic ' + new Buffer(opts.auth).toString('base64'));
	  Object.keys(opts.headers).forEach(function(name) {
	    self.setHeader(name, opts.headers[name]);
	  });

	  var preferBinary;
	  var useFetch = true;
	  if (opts.mode === 'disable-fetch') {
	    // If the use of XHR should be preferred and includes preserving the 'content-type' header
	    useFetch = false;
	    preferBinary = true;
	  } else if (opts.mode === 'prefer-streaming') {
	    // If streaming is a high priority but binary compatibility and
	    // the accuracy of the 'content-type' header aren't
	    preferBinary = false;
	  } else if (opts.mode === 'allow-wrong-content-type') {
	    // If streaming is more important than preserving the 'content-type' header
	    preferBinary = !overrideMimeType;
	  } else if (!opts.mode || opts.mode === 'default' || opts.mode === 'prefer-fast') {
	    // Use binary if text streaming may corrupt data or the content-type header, or for speed
	    preferBinary = true;
	  } else {
	    throw new Error('Invalid value for opts.mode')
	  }
	  self._mode = decideMode(preferBinary, useFetch);

	  self.on('finish', function() {
	    self._onFinish();
	  });
	}

	inherits$2(ClientRequest, Writable);
	// Taken from http://www.w3.org/TR/XMLHttpRequest/#the-setrequestheader%28%29-method
	var unsafeHeaders = [
	  'accept-charset',
	  'accept-encoding',
	  'access-control-request-headers',
	  'access-control-request-method',
	  'connection',
	  'content-length',
	  'cookie',
	  'cookie2',
	  'date',
	  'dnt',
	  'expect',
	  'host',
	  'keep-alive',
	  'origin',
	  'referer',
	  'te',
	  'trailer',
	  'transfer-encoding',
	  'upgrade',
	  'user-agent',
	  'via'
	];
	ClientRequest.prototype.setHeader = function(name, value) {
	  var self = this;
	  var lowerName = name.toLowerCase();
	    // This check is not necessary, but it prevents warnings from browsers about setting unsafe
	    // headers. To be honest I'm not entirely sure hiding these warnings is a good thing, but
	    // http-browserify did it, so I will too.
	  if (unsafeHeaders.indexOf(lowerName) !== -1)
	    return

	  self._headers[lowerName] = {
	    name: name,
	    value: value
	  };
	};

	ClientRequest.prototype.getHeader = function(name) {
	  var self = this;
	  return self._headers[name.toLowerCase()].value
	};

	ClientRequest.prototype.removeHeader = function(name) {
	  var self = this;
	  delete self._headers[name.toLowerCase()];
	};

	ClientRequest.prototype._onFinish = function() {
	  var self = this;

	  if (self._destroyed)
	    return
	  var opts = self._opts;

	  var headersObj = self._headers;
	  var body;
	  if (opts.method === 'POST' || opts.method === 'PUT' || opts.method === 'PATCH') {
	    if (blobConstructor()) {
	      body = new global$1.Blob(self._body.map(function(buffer) {
	        return toArrayBuffer(buffer)
	      }), {
	        type: (headersObj['content-type'] || {}).value || ''
	      });
	    } else {
	      // get utf8 string
	      body = Buffer.concat(self._body).toString();
	    }
	  }

	  if (self._mode === 'fetch') {
	    var headers = Object.keys(headersObj).map(function(name) {
	      return [headersObj[name].name, headersObj[name].value]
	    });

	    global$1.fetch(self._opts.url, {
	      method: self._opts.method,
	      headers: headers,
	      body: body,
	      mode: 'cors',
	      credentials: opts.withCredentials ? 'include' : 'same-origin'
	    }).then(function(response) {
	      self._fetchResponse = response;
	      self._connect();
	    }, function(reason) {
	      self.emit('error', reason);
	    });
	  } else {
	    var xhr = self._xhr = new global$1.XMLHttpRequest();
	    try {
	      xhr.open(self._opts.method, self._opts.url, true);
	    } catch (err) {
	      nextTick(function() {
	        self.emit('error', err);
	      });
	      return
	    }

	    // Can't set responseType on really old browsers
	    if ('responseType' in xhr)
	      xhr.responseType = self._mode.split(':')[0];

	    if ('withCredentials' in xhr)
	      xhr.withCredentials = !!opts.withCredentials;

	    if (self._mode === 'text' && 'overrideMimeType' in xhr)
	      xhr.overrideMimeType('text/plain; charset=x-user-defined');

	    Object.keys(headersObj).forEach(function(name) {
	      xhr.setRequestHeader(headersObj[name].name, headersObj[name].value);
	    });

	    self._response = null;
	    xhr.onreadystatechange = function() {
	      switch (xhr.readyState) {
	      case rStates.LOADING:
	      case rStates.DONE:
	        self._onXHRProgress();
	        break
	      }
	    };
	      // Necessary for streaming in Firefox, since xhr.response is ONLY defined
	      // in onprogress, not in onreadystatechange with xhr.readyState = 3
	    if (self._mode === 'moz-chunked-arraybuffer') {
	      xhr.onprogress = function() {
	        self._onXHRProgress();
	      };
	    }

	    xhr.onerror = function() {
	      if (self._destroyed)
	        return
	      self.emit('error', new Error('XHR error'));
	    };

	    try {
	      xhr.send(body);
	    } catch (err) {
	      nextTick(function() {
	        self.emit('error', err);
	      });
	      return
	    }
	  }
	};

	/**
	 * Checks if xhr.status is readable and non-zero, indicating no error.
	 * Even though the spec says it should be available in readyState 3,
	 * accessing it throws an exception in IE8
	 */
	function statusValid(xhr) {
	  try {
	    var status = xhr.status;
	    return (status !== null && status !== 0)
	  } catch (e) {
	    return false
	  }
	}

	ClientRequest.prototype._onXHRProgress = function() {
	  var self = this;

	  if (!statusValid(self._xhr) || self._destroyed)
	    return

	  if (!self._response)
	    self._connect();

	  self._response._onXHRProgress();
	};

	ClientRequest.prototype._connect = function() {
	  var self = this;

	  if (self._destroyed)
	    return

	  self._response = new IncomingMessage(self._xhr, self._fetchResponse, self._mode);
	  self.emit('response', self._response);
	};

	ClientRequest.prototype._write = function(chunk, encoding, cb) {
	  var self = this;

	  self._body.push(chunk);
	  cb();
	};

	ClientRequest.prototype.abort = ClientRequest.prototype.destroy = function() {
	  var self = this;
	  self._destroyed = true;
	  if (self._response)
	    self._response._destroyed = true;
	  if (self._xhr)
	    self._xhr.abort();
	    // Currently, there isn't a way to truly abort a fetch.
	    // If you like bikeshedding, see https://github.com/whatwg/fetch/issues/27
	};

	ClientRequest.prototype.end = function(data, encoding, cb) {
	  var self = this;
	  if (typeof data === 'function') {
	    cb = data;
	    data = undefined;
	  }

	  Writable.prototype.end.call(self, data, encoding, cb);
	};

	ClientRequest.prototype.flushHeaders = function() {};
	ClientRequest.prototype.setTimeout = function() {};
	ClientRequest.prototype.setNoDelay = function() {};
	ClientRequest.prototype.setSocketKeepAlive = function() {};

	/*! https://mths.be/punycode v1.4.1 by @mathias */


	/** Highest positive signed 32-bit float value */
	var maxInt = 2147483647; // aka. 0x7FFFFFFF or 2^31-1

	/** Bootstring parameters */
	var base = 36;
	var tMin = 1;
	var tMax = 26;
	var skew = 38;
	var damp = 700;
	var initialBias = 72;
	var initialN = 128; // 0x80
	var delimiter = '-'; // '\x2D'
	var regexNonASCII = /[^\x20-\x7E]/; // unprintable ASCII chars + non-ASCII chars
	var regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g; // RFC 3490 separators

	/** Error messages */
	var errors = {
	  'overflow': 'Overflow: input needs wider integers to process',
	  'not-basic': 'Illegal input >= 0x80 (not a basic code point)',
	  'invalid-input': 'Invalid input'
	};

	/** Convenience shortcuts */
	var baseMinusTMin = base - tMin;
	var floor$1 = Math.floor;
	var stringFromCharCode = String.fromCharCode;

	/*--------------------------------------------------------------------------*/

	/**
	 * A generic error utility function.
	 * @private
	 * @param {String} type The error type.
	 * @returns {Error} Throws a `RangeError` with the applicable error message.
	 */
	function error(type) {
	  throw new RangeError(errors[type]);
	}

	/**
	 * A generic `Array#map` utility function.
	 * @private
	 * @param {Array} array The array to iterate over.
	 * @param {Function} callback The function that gets called for every array
	 * item.
	 * @returns {Array} A new array of values returned by the callback function.
	 */
	function map(array, fn) {
	  var length = array.length;
	  var result = [];
	  while (length--) {
	    result[length] = fn(array[length]);
	  }
	  return result;
	}

	/**
	 * A simple `Array#map`-like wrapper to work with domain name strings or email
	 * addresses.
	 * @private
	 * @param {String} domain The domain name or email address.
	 * @param {Function} callback The function that gets called for every
	 * character.
	 * @returns {Array} A new string of characters returned by the callback
	 * function.
	 */
	function mapDomain(string, fn) {
	  var parts = string.split('@');
	  var result = '';
	  if (parts.length > 1) {
	    // In email addresses, only the domain name should be punycoded. Leave
	    // the local part (i.e. everything up to `@`) intact.
	    result = parts[0] + '@';
	    string = parts[1];
	  }
	  // Avoid `split(regex)` for IE8 compatibility. See #17.
	  string = string.replace(regexSeparators, '\x2E');
	  var labels = string.split('.');
	  var encoded = map(labels, fn).join('.');
	  return result + encoded;
	}

	/**
	 * Creates an array containing the numeric code points of each Unicode
	 * character in the string. While JavaScript uses UCS-2 internally,
	 * this function will convert a pair of surrogate halves (each of which
	 * UCS-2 exposes as separate characters) into a single code point,
	 * matching UTF-16.
	 * @see `punycode.ucs2.encode`
	 * @see <https://mathiasbynens.be/notes/javascript-encoding>
	 * @memberOf punycode.ucs2
	 * @name decode
	 * @param {String} string The Unicode input string (UCS-2).
	 * @returns {Array} The new array of code points.
	 */
	function ucs2decode(string) {
	  var output = [],
	    counter = 0,
	    length = string.length,
	    value,
	    extra;
	  while (counter < length) {
	    value = string.charCodeAt(counter++);
	    if (value >= 0xD800 && value <= 0xDBFF && counter < length) {
	      // high surrogate, and there is a next character
	      extra = string.charCodeAt(counter++);
	      if ((extra & 0xFC00) == 0xDC00) { // low surrogate
	        output.push(((value & 0x3FF) << 10) + (extra & 0x3FF) + 0x10000);
	      } else {
	        // unmatched surrogate; only append this code unit, in case the next
	        // code unit is the high surrogate of a surrogate pair
	        output.push(value);
	        counter--;
	      }
	    } else {
	      output.push(value);
	    }
	  }
	  return output;
	}

	/**
	 * Converts a digit/integer into a basic code point.
	 * @see `basicToDigit()`
	 * @private
	 * @param {Number} digit The numeric value of a basic code point.
	 * @returns {Number} The basic code point whose value (when used for
	 * representing integers) is `digit`, which needs to be in the range
	 * `0` to `base - 1`. If `flag` is non-zero, the uppercase form is
	 * used; else, the lowercase form is used. The behavior is undefined
	 * if `flag` is non-zero and `digit` has no uppercase form.
	 */
	function digitToBasic(digit, flag) {
	  //  0..25 map to ASCII a..z or A..Z
	  // 26..35 map to ASCII 0..9
	  return digit + 22 + 75 * (digit < 26) - ((flag != 0) << 5);
	}

	/**
	 * Bias adaptation function as per section 3.4 of RFC 3492.
	 * https://tools.ietf.org/html/rfc3492#section-3.4
	 * @private
	 */
	function adapt(delta, numPoints, firstTime) {
	  var k = 0;
	  delta = firstTime ? floor$1(delta / damp) : delta >> 1;
	  delta += floor$1(delta / numPoints);
	  for ( /* no initialization */ ; delta > baseMinusTMin * tMax >> 1; k += base) {
	    delta = floor$1(delta / baseMinusTMin);
	  }
	  return floor$1(k + (baseMinusTMin + 1) * delta / (delta + skew));
	}

	/**
	 * Converts a string of Unicode symbols (e.g. a domain name label) to a
	 * Punycode string of ASCII-only symbols.
	 * @memberOf punycode
	 * @param {String} input The string of Unicode symbols.
	 * @returns {String} The resulting Punycode string of ASCII-only symbols.
	 */
	function encode(input) {
	  var n,
	    delta,
	    handledCPCount,
	    basicLength,
	    bias,
	    j,
	    m,
	    q,
	    k,
	    t,
	    currentValue,
	    output = [],
	    /** `inputLength` will hold the number of code points in `input`. */
	    inputLength,
	    /** Cached calculation results */
	    handledCPCountPlusOne,
	    baseMinusT,
	    qMinusT;

	  // Convert the input in UCS-2 to Unicode
	  input = ucs2decode(input);

	  // Cache the length
	  inputLength = input.length;

	  // Initialize the state
	  n = initialN;
	  delta = 0;
	  bias = initialBias;

	  // Handle the basic code points
	  for (j = 0; j < inputLength; ++j) {
	    currentValue = input[j];
	    if (currentValue < 0x80) {
	      output.push(stringFromCharCode(currentValue));
	    }
	  }

	  handledCPCount = basicLength = output.length;

	  // `handledCPCount` is the number of code points that have been handled;
	  // `basicLength` is the number of basic code points.

	  // Finish the basic string - if it is not empty - with a delimiter
	  if (basicLength) {
	    output.push(delimiter);
	  }

	  // Main encoding loop:
	  while (handledCPCount < inputLength) {

	    // All non-basic code points < n have been handled already. Find the next
	    // larger one:
	    for (m = maxInt, j = 0; j < inputLength; ++j) {
	      currentValue = input[j];
	      if (currentValue >= n && currentValue < m) {
	        m = currentValue;
	      }
	    }

	    // Increase `delta` enough to advance the decoder's <n,i> state to <m,0>,
	    // but guard against overflow
	    handledCPCountPlusOne = handledCPCount + 1;
	    if (m - n > floor$1((maxInt - delta) / handledCPCountPlusOne)) {
	      error('overflow');
	    }

	    delta += (m - n) * handledCPCountPlusOne;
	    n = m;

	    for (j = 0; j < inputLength; ++j) {
	      currentValue = input[j];

	      if (currentValue < n && ++delta > maxInt) {
	        error('overflow');
	      }

	      if (currentValue == n) {
	        // Represent delta as a generalized variable-length integer
	        for (q = delta, k = base; /* no condition */ ; k += base) {
	          t = k <= bias ? tMin : (k >= bias + tMax ? tMax : k - bias);
	          if (q < t) {
	            break;
	          }
	          qMinusT = q - t;
	          baseMinusT = base - t;
	          output.push(
	            stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))
	          );
	          q = floor$1(qMinusT / baseMinusT);
	        }

	        output.push(stringFromCharCode(digitToBasic(q, 0)));
	        bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength);
	        delta = 0;
	        ++handledCPCount;
	      }
	    }

	    ++delta;
	    ++n;

	  }
	  return output.join('');
	}

	/**
	 * Converts a Unicode string representing a domain name or an email address to
	 * Punycode. Only the non-ASCII parts of the domain name will be converted,
	 * i.e. it doesn't matter if you call it with a domain that's already in
	 * ASCII.
	 * @memberOf punycode
	 * @param {String} input The domain name or email address to convert, as a
	 * Unicode string.
	 * @returns {String} The Punycode representation of the given domain name or
	 * email address.
	 */
	function toASCII(input) {
	  return mapDomain(input, function(string) {
	    return regexNonASCII.test(string) ?
	      'xn--' + encode(string) :
	      string;
	  });
	}

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.


	// If obj.hasOwnProperty has been overridden, then calling
	// obj.hasOwnProperty(prop) will break.
	// See: https://github.com/joyent/node/issues/1707
	function hasOwnProperty$2(obj, prop) {
	  return Object.prototype.hasOwnProperty.call(obj, prop);
	}
	var isArray$2 = Array.isArray || function (xs) {
	  return Object.prototype.toString.call(xs) === '[object Array]';
	};
	function stringifyPrimitive(v) {
	  switch (typeof v) {
	    case 'string':
	      return v;

	    case 'boolean':
	      return v ? 'true' : 'false';

	    case 'number':
	      return isFinite(v) ? v : '';

	    default:
	      return '';
	  }
	}

	function stringify$2 (obj, sep, eq, name) {
	  sep = sep || '&';
	  eq = eq || '=';
	  if (obj === null) {
	    obj = undefined;
	  }

	  if (typeof obj === 'object') {
	    return map$1(objectKeys(obj), function(k) {
	      var ks = encodeURIComponent(stringifyPrimitive(k)) + eq;
	      if (isArray$2(obj[k])) {
	        return map$1(obj[k], function(v) {
	          return ks + encodeURIComponent(stringifyPrimitive(v));
	        }).join(sep);
	      } else {
	        return ks + encodeURIComponent(stringifyPrimitive(obj[k]));
	      }
	    }).join(sep);

	  }

	  if (!name) return '';
	  return encodeURIComponent(stringifyPrimitive(name)) + eq +
	         encodeURIComponent(stringifyPrimitive(obj));
	}
	function map$1 (xs, f) {
	  if (xs.map) return xs.map(f);
	  var res = [];
	  for (var i = 0; i < xs.length; i++) {
	    res.push(f(xs[i], i));
	  }
	  return res;
	}

	var objectKeys = Object.keys || function (obj) {
	  var res = [];
	  for (var key in obj) {
	    if (Object.prototype.hasOwnProperty.call(obj, key)) res.push(key);
	  }
	  return res;
	};

	function parse(qs, sep, eq, options) {
	  sep = sep || '&';
	  eq = eq || '=';
	  var obj = {};

	  if (typeof qs !== 'string' || qs.length === 0) {
	    return obj;
	  }

	  var regexp = /\+/g;
	  qs = qs.split(sep);

	  var maxKeys = 1000;
	  if (options && typeof options.maxKeys === 'number') {
	    maxKeys = options.maxKeys;
	  }

	  var len = qs.length;
	  // maxKeys <= 0 means that we should not limit keys count
	  if (maxKeys > 0 && len > maxKeys) {
	    len = maxKeys;
	  }

	  for (var i = 0; i < len; ++i) {
	    var x = qs[i].replace(regexp, '%20'),
	        idx = x.indexOf(eq),
	        kstr, vstr, k, v;

	    if (idx >= 0) {
	      kstr = x.substr(0, idx);
	      vstr = x.substr(idx + 1);
	    } else {
	      kstr = x;
	      vstr = '';
	    }

	    k = decodeURIComponent(kstr);
	    v = decodeURIComponent(vstr);

	    if (!hasOwnProperty$2(obj, k)) {
	      obj[k] = v;
	    } else if (isArray$2(obj[k])) {
	      obj[k].push(v);
	    } else {
	      obj[k] = [obj[k], v];
	    }
	  }

	  return obj;
	}

	// Copyright Joyent, Inc. and other Node contributors.
	function Url() {
	  this.protocol = null;
	  this.slashes = null;
	  this.auth = null;
	  this.host = null;
	  this.port = null;
	  this.hostname = null;
	  this.hash = null;
	  this.search = null;
	  this.query = null;
	  this.pathname = null;
	  this.path = null;
	  this.href = null;
	}

	// Reference: RFC 3986, RFC 1808, RFC 2396

	// define these here so at least they only have to be
	// compiled once on the first module load.
	var protocolPattern = /^([a-z0-9.+-]+:)/i,
	  portPattern = /:[0-9]*$/,

	  // Special case for a simple path URL
	  simplePathPattern = /^(\/\/?(?!\/)[^\?\s]*)(\?[^\s]*)?$/,

	  // RFC 2396: characters reserved for delimiting URLs.
	  // We actually just auto-escape these.
	  delims = ['<', '>', '"', '`', ' ', '\r', '\n', '\t'],

	  // RFC 2396: characters not allowed for various reasons.
	  unwise = ['{', '}', '|', '\\', '^', '`'].concat(delims),

	  // Allowed by RFCs, but cause of XSS attacks.  Always escape these.
	  autoEscape = ['\''].concat(unwise),
	  // Characters that are never ever allowed in a hostname.
	  // Note that any invalid chars are also handled, but these
	  // are the ones that are *expected* to be seen, so we fast-path
	  // them.
	  nonHostChars = ['%', '/', '?', ';', '#'].concat(autoEscape),
	  hostEndingChars = ['/', '?', '#'],
	  hostnameMaxLen = 255,
	  hostnamePartPattern = /^[+a-z0-9A-Z_-]{0,63}$/,
	  hostnamePartStart = /^([+a-z0-9A-Z_-]{0,63})(.*)$/,
	  // protocols that can allow "unsafe" and "unwise" chars.
	  unsafeProtocol = {
	    'javascript': true,
	    'javascript:': true
	  },
	  // protocols that never have a hostname.
	  hostlessProtocol = {
	    'javascript': true,
	    'javascript:': true
	  },
	  // protocols that always contain a // bit.
	  slashedProtocol = {
	    'http': true,
	    'https': true,
	    'ftp': true,
	    'gopher': true,
	    'file': true,
	    'http:': true,
	    'https:': true,
	    'ftp:': true,
	    'gopher:': true,
	    'file:': true
	  };

	function urlParse(url, parseQueryString, slashesDenoteHost) {
	  if (url && isObject(url) && url instanceof Url) return url;

	  var u = new Url;
	  u.parse(url, parseQueryString, slashesDenoteHost);
	  return u;
	}
	Url.prototype.parse = function(url, parseQueryString, slashesDenoteHost) {
	  return parse$1(this, url, parseQueryString, slashesDenoteHost);
	};

	function parse$1(self, url, parseQueryString, slashesDenoteHost) {
	  if (!isString(url)) {
	    throw new TypeError('Parameter \'url\' must be a string, not ' + typeof url);
	  }

	  // Copy chrome, IE, opera backslash-handling behavior.
	  // Back slashes before the query string get converted to forward slashes
	  // See: https://code.google.com/p/chromium/issues/detail?id=25916
	  var queryIndex = url.indexOf('?'),
	    splitter =
	    (queryIndex !== -1 && queryIndex < url.indexOf('#')) ? '?' : '#',
	    uSplit = url.split(splitter),
	    slashRegex = /\\/g;
	  uSplit[0] = uSplit[0].replace(slashRegex, '/');
	  url = uSplit.join(splitter);

	  var rest = url;

	  // trim before proceeding.
	  // This is to support parse stuff like "  http://foo.com  \n"
	  rest = rest.trim();

	  if (!slashesDenoteHost && url.split('#').length === 1) {
	    // Try fast path regexp
	    var simplePath = simplePathPattern.exec(rest);
	    if (simplePath) {
	      self.path = rest;
	      self.href = rest;
	      self.pathname = simplePath[1];
	      if (simplePath[2]) {
	        self.search = simplePath[2];
	        if (parseQueryString) {
	          self.query = parse(self.search.substr(1));
	        } else {
	          self.query = self.search.substr(1);
	        }
	      } else if (parseQueryString) {
	        self.search = '';
	        self.query = {};
	      }
	      return self;
	    }
	  }

	  var proto = protocolPattern.exec(rest);
	  if (proto) {
	    proto = proto[0];
	    var lowerProto = proto.toLowerCase();
	    self.protocol = lowerProto;
	    rest = rest.substr(proto.length);
	  }

	  // figure out if it's got a host
	  // user@server is *always* interpreted as a hostname, and url
	  // resolution will treat //foo/bar as host=foo,path=bar because that's
	  // how the browser resolves relative URLs.
	  if (slashesDenoteHost || proto || rest.match(/^\/\/[^@\/]+@[^@\/]+/)) {
	    var slashes = rest.substr(0, 2) === '//';
	    if (slashes && !(proto && hostlessProtocol[proto])) {
	      rest = rest.substr(2);
	      self.slashes = true;
	    }
	  }
	  var i, hec, l, p;
	  if (!hostlessProtocol[proto] &&
	    (slashes || (proto && !slashedProtocol[proto]))) {

	    // there's a hostname.
	    // the first instance of /, ?, ;, or # ends the host.
	    //
	    // If there is an @ in the hostname, then non-host chars *are* allowed
	    // to the left of the last @ sign, unless some host-ending character
	    // comes *before* the @-sign.
	    // URLs are obnoxious.
	    //
	    // ex:
	    // http://a@b@c/ => user:a@b host:c
	    // http://a@b?@c => user:a host:c path:/?@c

	    // v0.12 TODO(isaacs): This is not quite how Chrome does things.
	    // Review our test case against browsers more comprehensively.

	    // find the first instance of any hostEndingChars
	    var hostEnd = -1;
	    for (i = 0; i < hostEndingChars.length; i++) {
	      hec = rest.indexOf(hostEndingChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }

	    // at this point, either we have an explicit point where the
	    // auth portion cannot go past, or the last @ char is the decider.
	    var auth, atSign;
	    if (hostEnd === -1) {
	      // atSign can be anywhere.
	      atSign = rest.lastIndexOf('@');
	    } else {
	      // atSign must be in auth portion.
	      // http://a@b/c@d => host:b auth:a path:/c@d
	      atSign = rest.lastIndexOf('@', hostEnd);
	    }

	    // Now we have a portion which is definitely the auth.
	    // Pull that off.
	    if (atSign !== -1) {
	      auth = rest.slice(0, atSign);
	      rest = rest.slice(atSign + 1);
	      self.auth = decodeURIComponent(auth);
	    }

	    // the host is the remaining to the left of the first non-host char
	    hostEnd = -1;
	    for (i = 0; i < nonHostChars.length; i++) {
	      hec = rest.indexOf(nonHostChars[i]);
	      if (hec !== -1 && (hostEnd === -1 || hec < hostEnd))
	        hostEnd = hec;
	    }
	    // if we still have not hit it, then the entire thing is a host.
	    if (hostEnd === -1)
	      hostEnd = rest.length;

	    self.host = rest.slice(0, hostEnd);
	    rest = rest.slice(hostEnd);

	    // pull out port.
	    parseHost(self);

	    // we've indicated that there is a hostname,
	    // so even if it's empty, it has to be present.
	    self.hostname = self.hostname || '';

	    // if hostname begins with [ and ends with ]
	    // assume that it's an IPv6 address.
	    var ipv6Hostname = self.hostname[0] === '[' &&
	      self.hostname[self.hostname.length - 1] === ']';

	    // validate a little.
	    if (!ipv6Hostname) {
	      var hostparts = self.hostname.split(/\./);
	      for (i = 0, l = hostparts.length; i < l; i++) {
	        var part = hostparts[i];
	        if (!part) continue;
	        if (!part.match(hostnamePartPattern)) {
	          var newpart = '';
	          for (var j = 0, k = part.length; j < k; j++) {
	            if (part.charCodeAt(j) > 127) {
	              // we replace non-ASCII char with a temporary placeholder
	              // we need this to make sure size of hostname is not
	              // broken by replacing non-ASCII by nothing
	              newpart += 'x';
	            } else {
	              newpart += part[j];
	            }
	          }
	          // we test again with ASCII char only
	          if (!newpart.match(hostnamePartPattern)) {
	            var validParts = hostparts.slice(0, i);
	            var notHost = hostparts.slice(i + 1);
	            var bit = part.match(hostnamePartStart);
	            if (bit) {
	              validParts.push(bit[1]);
	              notHost.unshift(bit[2]);
	            }
	            if (notHost.length) {
	              rest = '/' + notHost.join('.') + rest;
	            }
	            self.hostname = validParts.join('.');
	            break;
	          }
	        }
	      }
	    }

	    if (self.hostname.length > hostnameMaxLen) {
	      self.hostname = '';
	    } else {
	      // hostnames are always lower case.
	      self.hostname = self.hostname.toLowerCase();
	    }

	    if (!ipv6Hostname) {
	      // IDNA Support: Returns a punycoded representation of "domain".
	      // It only converts parts of the domain name that
	      // have non-ASCII characters, i.e. it doesn't matter if
	      // you call it with a domain that already is ASCII-only.
	      self.hostname = toASCII(self.hostname);
	    }

	    p = self.port ? ':' + self.port : '';
	    var h = self.hostname || '';
	    self.host = h + p;
	    self.href += self.host;

	    // strip [ and ] from the hostname
	    // the host field still retains them, though
	    if (ipv6Hostname) {
	      self.hostname = self.hostname.substr(1, self.hostname.length - 2);
	      if (rest[0] !== '/') {
	        rest = '/' + rest;
	      }
	    }
	  }

	  // now rest is set to the post-host stuff.
	  // chop off any delim chars.
	  if (!unsafeProtocol[lowerProto]) {

	    // First, make 100% sure that any "autoEscape" chars get
	    // escaped, even if encodeURIComponent doesn't think they
	    // need to be.
	    for (i = 0, l = autoEscape.length; i < l; i++) {
	      var ae = autoEscape[i];
	      if (rest.indexOf(ae) === -1)
	        continue;
	      var esc = encodeURIComponent(ae);
	      if (esc === ae) {
	        esc = escape(ae);
	      }
	      rest = rest.split(ae).join(esc);
	    }
	  }


	  // chop off from the tail first.
	  var hash = rest.indexOf('#');
	  if (hash !== -1) {
	    // got a fragment string.
	    self.hash = rest.substr(hash);
	    rest = rest.slice(0, hash);
	  }
	  var qm = rest.indexOf('?');
	  if (qm !== -1) {
	    self.search = rest.substr(qm);
	    self.query = rest.substr(qm + 1);
	    if (parseQueryString) {
	      self.query = parse(self.query);
	    }
	    rest = rest.slice(0, qm);
	  } else if (parseQueryString) {
	    // no query string, but parseQueryString still requested
	    self.search = '';
	    self.query = {};
	  }
	  if (rest) self.pathname = rest;
	  if (slashedProtocol[lowerProto] &&
	    self.hostname && !self.pathname) {
	    self.pathname = '/';
	  }

	  //to support http.request
	  if (self.pathname || self.search) {
	    p = self.pathname || '';
	    var s = self.search || '';
	    self.path = p + s;
	  }

	  // finally, reconstruct the href based on what has been validated.
	  self.href = format$1(self);
	  return self;
	}

	function format$1(self) {
	  var auth = self.auth || '';
	  if (auth) {
	    auth = encodeURIComponent(auth);
	    auth = auth.replace(/%3A/i, ':');
	    auth += '@';
	  }

	  var protocol = self.protocol || '',
	    pathname = self.pathname || '',
	    hash = self.hash || '',
	    host = false,
	    query = '';

	  if (self.host) {
	    host = auth + self.host;
	  } else if (self.hostname) {
	    host = auth + (self.hostname.indexOf(':') === -1 ?
	      self.hostname :
	      '[' + this.hostname + ']');
	    if (self.port) {
	      host += ':' + self.port;
	    }
	  }

	  if (self.query &&
	    isObject(self.query) &&
	    Object.keys(self.query).length) {
	    query = stringify$2(self.query);
	  }

	  var search = self.search || (query && ('?' + query)) || '';

	  if (protocol && protocol.substr(-1) !== ':') protocol += ':';

	  // only the slashedProtocols get the //.  Not mailto:, xmpp:, etc.
	  // unless they had them to begin with.
	  if (self.slashes ||
	    (!protocol || slashedProtocol[protocol]) && host !== false) {
	    host = '//' + (host || '');
	    if (pathname && pathname.charAt(0) !== '/') pathname = '/' + pathname;
	  } else if (!host) {
	    host = '';
	  }

	  if (hash && hash.charAt(0) !== '#') hash = '#' + hash;
	  if (search && search.charAt(0) !== '?') search = '?' + search;

	  pathname = pathname.replace(/[?#]/g, function(match) {
	    return encodeURIComponent(match);
	  });
	  search = search.replace('#', '%23');

	  return protocol + host + pathname + search + hash;
	}

	Url.prototype.format = function() {
	  return format$1(this);
	};

	Url.prototype.resolve = function(relative) {
	  return this.resolveObject(urlParse(relative, false, true)).format();
	};

	Url.prototype.resolveObject = function(relative) {
	  if (isString(relative)) {
	    var rel = new Url();
	    rel.parse(relative, false, true);
	    relative = rel;
	  }

	  var result = new Url();
	  var tkeys = Object.keys(this);
	  for (var tk = 0; tk < tkeys.length; tk++) {
	    var tkey = tkeys[tk];
	    result[tkey] = this[tkey];
	  }

	  // hash is always overridden, no matter what.
	  // even href="" will remove it.
	  result.hash = relative.hash;

	  // if the relative url is empty, then there's nothing left to do here.
	  if (relative.href === '') {
	    result.href = result.format();
	    return result;
	  }

	  // hrefs like //foo/bar always cut to the protocol.
	  if (relative.slashes && !relative.protocol) {
	    // take everything except the protocol from relative
	    var rkeys = Object.keys(relative);
	    for (var rk = 0; rk < rkeys.length; rk++) {
	      var rkey = rkeys[rk];
	      if (rkey !== 'protocol')
	        result[rkey] = relative[rkey];
	    }

	    //urlParse appends trailing / to urls like http://www.example.com
	    if (slashedProtocol[result.protocol] &&
	      result.hostname && !result.pathname) {
	      result.path = result.pathname = '/';
	    }

	    result.href = result.format();
	    return result;
	  }
	  var relPath;
	  if (relative.protocol && relative.protocol !== result.protocol) {
	    // if it's a known url protocol, then changing
	    // the protocol does weird things
	    // first, if it's not file:, then we MUST have a host,
	    // and if there was a path
	    // to begin with, then we MUST have a path.
	    // if it is file:, then the host is dropped,
	    // because that's known to be hostless.
	    // anything else is assumed to be absolute.
	    if (!slashedProtocol[relative.protocol]) {
	      var keys = Object.keys(relative);
	      for (var v = 0; v < keys.length; v++) {
	        var k = keys[v];
	        result[k] = relative[k];
	      }
	      result.href = result.format();
	      return result;
	    }

	    result.protocol = relative.protocol;
	    if (!relative.host && !hostlessProtocol[relative.protocol]) {
	      relPath = (relative.pathname || '').split('/');
	      while (relPath.length && !(relative.host = relPath.shift()));
	      if (!relative.host) relative.host = '';
	      if (!relative.hostname) relative.hostname = '';
	      if (relPath[0] !== '') relPath.unshift('');
	      if (relPath.length < 2) relPath.unshift('');
	      result.pathname = relPath.join('/');
	    } else {
	      result.pathname = relative.pathname;
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    result.host = relative.host || '';
	    result.auth = relative.auth;
	    result.hostname = relative.hostname || relative.host;
	    result.port = relative.port;
	    // to support http.request
	    if (result.pathname || result.search) {
	      var p = result.pathname || '';
	      var s = result.search || '';
	      result.path = p + s;
	    }
	    result.slashes = result.slashes || relative.slashes;
	    result.href = result.format();
	    return result;
	  }

	  var isSourceAbs = (result.pathname && result.pathname.charAt(0) === '/'),
	    isRelAbs = (
	      relative.host ||
	      relative.pathname && relative.pathname.charAt(0) === '/'
	    ),
	    mustEndAbs = (isRelAbs || isSourceAbs ||
	      (result.host && relative.pathname)),
	    removeAllDots = mustEndAbs,
	    srcPath = result.pathname && result.pathname.split('/') || [],
	    psychotic = result.protocol && !slashedProtocol[result.protocol];
	  relPath = relative.pathname && relative.pathname.split('/') || [];
	  // if the url is a non-slashed url, then relative
	  // links like ../.. should be able
	  // to crawl up to the hostname, as well.  This is strange.
	  // result.protocol has already been set by now.
	  // Later on, put the first path part into the host field.
	  if (psychotic) {
	    result.hostname = '';
	    result.port = null;
	    if (result.host) {
	      if (srcPath[0] === '') srcPath[0] = result.host;
	      else srcPath.unshift(result.host);
	    }
	    result.host = '';
	    if (relative.protocol) {
	      relative.hostname = null;
	      relative.port = null;
	      if (relative.host) {
	        if (relPath[0] === '') relPath[0] = relative.host;
	        else relPath.unshift(relative.host);
	      }
	      relative.host = null;
	    }
	    mustEndAbs = mustEndAbs && (relPath[0] === '' || srcPath[0] === '');
	  }
	  var authInHost;
	  if (isRelAbs) {
	    // it's absolute.
	    result.host = (relative.host || relative.host === '') ?
	      relative.host : result.host;
	    result.hostname = (relative.hostname || relative.hostname === '') ?
	      relative.hostname : result.hostname;
	    result.search = relative.search;
	    result.query = relative.query;
	    srcPath = relPath;
	    // fall through to the dot-handling below.
	  } else if (relPath.length) {
	    // it's relative
	    // throw away the existing file, and take the new path instead.
	    if (!srcPath) srcPath = [];
	    srcPath.pop();
	    srcPath = srcPath.concat(relPath);
	    result.search = relative.search;
	    result.query = relative.query;
	  } else if (!isNullOrUndefined(relative.search)) {
	    // just pull out the search.
	    // like href='?foo'.
	    // Put this after the other two cases because it simplifies the booleans
	    if (psychotic) {
	      result.hostname = result.host = srcPath.shift();
	      //occationaly the auth can get stuck only in host
	      //this especially happens in cases like
	      //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	      authInHost = result.host && result.host.indexOf('@') > 0 ?
	        result.host.split('@') : false;
	      if (authInHost) {
	        result.auth = authInHost.shift();
	        result.host = result.hostname = authInHost.shift();
	      }
	    }
	    result.search = relative.search;
	    result.query = relative.query;
	    //to support http.request
	    if (!isNull(result.pathname) || !isNull(result.search)) {
	      result.path = (result.pathname ? result.pathname : '') +
	        (result.search ? result.search : '');
	    }
	    result.href = result.format();
	    return result;
	  }

	  if (!srcPath.length) {
	    // no path at all.  easy.
	    // we've already handled the other stuff above.
	    result.pathname = null;
	    //to support http.request
	    if (result.search) {
	      result.path = '/' + result.search;
	    } else {
	      result.path = null;
	    }
	    result.href = result.format();
	    return result;
	  }

	  // if a url ENDs in . or .., then it must get a trailing slash.
	  // however, if it ends in anything else non-slashy,
	  // then it must NOT get a trailing slash.
	  var last = srcPath.slice(-1)[0];
	  var hasTrailingSlash = (
	    (result.host || relative.host || srcPath.length > 1) &&
	    (last === '.' || last === '..') || last === '');

	  // strip single dots, resolve double dots to parent dir
	  // if the path tries to go above the root, `up` ends up > 0
	  var up = 0;
	  for (var i = srcPath.length; i >= 0; i--) {
	    last = srcPath[i];
	    if (last === '.') {
	      srcPath.splice(i, 1);
	    } else if (last === '..') {
	      srcPath.splice(i, 1);
	      up++;
	    } else if (up) {
	      srcPath.splice(i, 1);
	      up--;
	    }
	  }

	  // if the path is allowed to go above the root, restore leading ..s
	  if (!mustEndAbs && !removeAllDots) {
	    for (; up--; up) {
	      srcPath.unshift('..');
	    }
	  }

	  if (mustEndAbs && srcPath[0] !== '' &&
	    (!srcPath[0] || srcPath[0].charAt(0) !== '/')) {
	    srcPath.unshift('');
	  }

	  if (hasTrailingSlash && (srcPath.join('/').substr(-1) !== '/')) {
	    srcPath.push('');
	  }

	  var isAbsolute = srcPath[0] === '' ||
	    (srcPath[0] && srcPath[0].charAt(0) === '/');

	  // put the host back
	  if (psychotic) {
	    result.hostname = result.host = isAbsolute ? '' :
	      srcPath.length ? srcPath.shift() : '';
	    //occationaly the auth can get stuck only in host
	    //this especially happens in cases like
	    //url.resolveObject('mailto:local1@domain1', 'local2@domain2')
	    authInHost = result.host && result.host.indexOf('@') > 0 ?
	      result.host.split('@') : false;
	    if (authInHost) {
	      result.auth = authInHost.shift();
	      result.host = result.hostname = authInHost.shift();
	    }
	  }

	  mustEndAbs = mustEndAbs || (result.host && srcPath.length);

	  if (mustEndAbs && !isAbsolute) {
	    srcPath.unshift('');
	  }

	  if (!srcPath.length) {
	    result.pathname = null;
	    result.path = null;
	  } else {
	    result.pathname = srcPath.join('/');
	  }

	  //to support request.http
	  if (!isNull(result.pathname) || !isNull(result.search)) {
	    result.path = (result.pathname ? result.pathname : '') +
	      (result.search ? result.search : '');
	  }
	  result.auth = relative.auth || result.auth;
	  result.slashes = result.slashes || relative.slashes;
	  result.href = result.format();
	  return result;
	};

	Url.prototype.parseHost = function() {
	  return parseHost(this);
	};

	function parseHost(self) {
	  var host = self.host;
	  var port = portPattern.exec(host);
	  if (port) {
	    port = port[0];
	    if (port !== ':') {
	      self.port = port.substr(1);
	    }
	    host = host.substr(0, host.length - port.length);
	  }
	  if (host) self.hostname = host;
	}

	function request(opts, cb) {
	  if (typeof opts === 'string')
	    opts = urlParse(opts);


	  // Normally, the page is loaded from http or https, so not specifying a protocol
	  // will result in a (valid) protocol-relative url. However, this won't work if
	  // the protocol is something else, like 'file:'
	  var defaultProtocol = global$1.location.protocol.search(/^https?:$/) === -1 ? 'http:' : '';

	  var protocol = opts.protocol || defaultProtocol;
	  var host = opts.hostname || opts.host;
	  var port = opts.port;
	  var path = opts.path || '/';

	  // Necessary for IPv6 addresses
	  if (host && host.indexOf(':') !== -1)
	    host = '[' + host + ']';

	  // This may be a relative url. The browser should always be able to interpret it correctly.
	  opts.url = (host ? (protocol + '//' + host) : '') + (port ? ':' + port : '') + path;
	  opts.method = (opts.method || 'GET').toUpperCase();
	  opts.headers = opts.headers || {};

	  // Also valid opts.auth, opts.mode

	  var req = new ClientRequest(opts);
	  if (cb)
	    req.on('response', cb);
	  return req
	}

	function get(opts, cb) {
	  var req = request(opts, cb);
	  req.end();
	  return req
	}

	function Agent() {}
	Agent.defaultMaxSockets = 4;

	var METHODS = [
	  'CHECKOUT',
	  'CONNECT',
	  'COPY',
	  'DELETE',
	  'GET',
	  'HEAD',
	  'LOCK',
	  'M-SEARCH',
	  'MERGE',
	  'MKACTIVITY',
	  'MKCOL',
	  'MOVE',
	  'NOTIFY',
	  'OPTIONS',
	  'PATCH',
	  'POST',
	  'PROPFIND',
	  'PROPPATCH',
	  'PURGE',
	  'PUT',
	  'REPORT',
	  'SEARCH',
	  'SUBSCRIBE',
	  'TRACE',
	  'UNLOCK',
	  'UNSUBSCRIBE'
	];
	var STATUS_CODES = {
	  100: 'Continue',
	  101: 'Switching Protocols',
	  102: 'Processing', // RFC 2518, obsoleted by RFC 4918
	  200: 'OK',
	  201: 'Created',
	  202: 'Accepted',
	  203: 'Non-Authoritative Information',
	  204: 'No Content',
	  205: 'Reset Content',
	  206: 'Partial Content',
	  207: 'Multi-Status', // RFC 4918
	  300: 'Multiple Choices',
	  301: 'Moved Permanently',
	  302: 'Moved Temporarily',
	  303: 'See Other',
	  304: 'Not Modified',
	  305: 'Use Proxy',
	  307: 'Temporary Redirect',
	  400: 'Bad Request',
	  401: 'Unauthorized',
	  402: 'Payment Required',
	  403: 'Forbidden',
	  404: 'Not Found',
	  405: 'Method Not Allowed',
	  406: 'Not Acceptable',
	  407: 'Proxy Authentication Required',
	  408: 'Request Time-out',
	  409: 'Conflict',
	  410: 'Gone',
	  411: 'Length Required',
	  412: 'Precondition Failed',
	  413: 'Request Entity Too Large',
	  414: 'Request-URI Too Large',
	  415: 'Unsupported Media Type',
	  416: 'Requested Range Not Satisfiable',
	  417: 'Expectation Failed',
	  418: 'I\'m a teapot', // RFC 2324
	  422: 'Unprocessable Entity', // RFC 4918
	  423: 'Locked', // RFC 4918
	  424: 'Failed Dependency', // RFC 4918
	  425: 'Unordered Collection', // RFC 4918
	  426: 'Upgrade Required', // RFC 2817
	  428: 'Precondition Required', // RFC 6585
	  429: 'Too Many Requests', // RFC 6585
	  431: 'Request Header Fields Too Large', // RFC 6585
	  500: 'Internal Server Error',
	  501: 'Not Implemented',
	  502: 'Bad Gateway',
	  503: 'Service Unavailable',
	  504: 'Gateway Time-out',
	  505: 'HTTP Version Not Supported',
	  506: 'Variant Also Negotiates', // RFC 2295
	  507: 'Insufficient Storage', // RFC 4918
	  509: 'Bandwidth Limit Exceeded',
	  510: 'Not Extended', // RFC 2774
	  511: 'Network Authentication Required' // RFC 6585
	};

	var http = {
	  request,
	  get,
	  Agent,
	  METHODS,
	  STATUS_CODES
	};

	var isNode$2 = false;
	try {
	  isNode$2 = Object.prototype.toString.call(global$1.process) === '[object process]';
	} catch (e) {
	}

	async function loadGunDepth(chain) {
	  var maxDepth = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 2;
	  var opts = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

	  opts.maxBreadth = opts.maxBreadth || 50;
	  opts.cache = opts.cache || {};

	  return chain.then().then(function (layer) {

	    // Depth limit reached, or non-object, or array value returned
	    if (maxDepth < 1 || !layer || (typeof layer === 'undefined' ? 'undefined' : _typeof(layer)) !== 'object' || layer.constructor === Array) {
	      return layer;
	    }

	    var bcount = 0;
	    var promises = _Object$keys(layer).map(function (key) {
	      // Only fetch links & restrict total search queries to maxBreadth ^ maxDepth requests
	      if (!Gun.val.link.is(layer[key]) || ++bcount >= opts.maxBreadth) {
	        return;
	      }

	      // During one recursive lookup, don't fetch the same key multiple times
	      if (opts.cache[key]) {
	        return opts.cache[key].then(function (data) {
	          layer[key] = data;
	        });
	      }

	      return opts.cache[key] = loadGunDepth(chain.get(key), maxDepth - 1, opts).then(function (data) {
	        layer[key] = data;
	      });
	    });

	    return _Promise.all(promises).then(function () {
	      return layer;
	    });
	  });
	}

	/*
	 * Helper for managing pools of Gun nodes. Primarily meant to simplify toplogy tracking in Iris tests.
	 * For reference, here's a run-through by example. Under each call, is  an explanation of what happens.
	 *
	 * Instances can be identified by the port they're listening on, which is saved under .netPort for reference.
	 *
	 * const nets = GunNets();
	 *
	 * nets.spawnNodes(2):   * net ID: 1, A root, B points to A
	 *   - returns [A, B]
	 *   - B peers with A
	 *   - netId is 1 for both
	 *
	 * nets.spawnNodes(1):
	 *   - returns [C]
	 *   - C has no peers
	 *   - netId is 2
	 *
	 * nets.spawnNodes(2, C.netId)
	 *   - returns  [D, E]
	 *   - D, E both peer with C
	 *   - netId is 2
	 *
	 * nets.spawnNodes(1, E.netId)
	 *   - returns [F]
	 *   - F peers with C
	 *   - netId is 2
	 *
	 * nets.spawnNodes(2, 'test')
	 *   - returns [G, H]
	 *   - H peers with G
	 *   - netId is 'test'
	 *
	 * nets.joinNets(B, H)
	 *   - A peers with G (and B by proxy), G is root, so peering goes like:
	 *      B -> A -> G
	 *      H -> G
	 *   - All nodes now have G.netID, so 'test' as .netID
	 *
	 * nets.joinNets(D, H)
	 *   - D,E,F still point to C, which now peers with G, meaning:
	 *     B -> A -> G
	 *     H -> G
	 *     D,E,F -> C -> G
	 *   - All share netId 'test'
	 *
	 * @param fromPort
	 * @param ip
	 * @constructor
	 */
	function GunNets() {
	  var _this = this;

	  var fromPort = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 12500;
	  var ip = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : '127.0.0.1';

	  var gunNets = {};
	  var nextNetId = 1;
	  var nextPort = fromPort;

	  // Small internal helper function. Just adds a new peer to the given gun instance.
	  function addPeer(gun, ip, port) {
	    //const oldPeers = gun.opt()['_'].opt.peers;
	    return gun.opt({ peers: ['http: *' + ip + ':' + port + '/gun'] }); // Should these be linked both ways?
	  }

	  async function dropPeer(gun, peerUrl) {
	    // If peerUrl not specified -> drop all
	    if (!peerUrl) {
	      return await _Promise.all(_Object$keys(gun._.opt.peers).map(function (key) {
	        return dropPeer(gun, key);
	      }));
	    }

	    var peer = gun._.opt.peers[peerUrl];
	    if (peer.wire) {
	      peer.url = peer.id = null; // Prevent reconnecting to URL
	      if (peer.wire) {
	        await peer.wire.close(); // Websocket, if open
	      }
	    }

	    delete gun._.opt.peers[peerUrl];
	  }

	  /*
	   * When called, creates a number of Gun nodes, all having the root node as their peer. If netId is not given,
	   * next sequential number is used. If netId of an existing net is provided, will use its root node as the
	   * target and add new nodes to the same net.
	   *
	   * Returns the list of newly created nodes.
	   *
	   * @param number
	   * @param netId
	   *
	   */
	  this.spawnNodes = function () {
	    var number = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
	    var netId = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;

	    if (!netId) {
	      netId = nextNetId++;
	    }

	    var ports = [];
	    for (var i = 0; i < number; ++i) {
	      ports.push(nextPort++);
	    }

	    // Spawn guns, connect them to each other
	    var newGuns = ports.map(function (port) {
	      var server = http.createServer(Gun.serve).listen(port, ip);
	      var g = new Gun({
	        radisk: false,
	        port: port,
	        multicast: false,
	        peers: {},
	        // file: `${configDir}/${gunDBName}.${port}`,
	        web: server
	      });
	      g.netPort = port;
	      g.netId = netId;
	      return g;
	    });

	    // Connect root node to other peers, if applicable
	    var root = gunNets[netId] || newGuns[0];
	    newGuns.forEach(function (gun) {
	      // Don't connect to itself, if root is newGuns[0]
	      if (gun.netPort === root.netPort) {
	        return;
	      }
	      addPeer(gun, ip, root.netPort);
	      addPeer(root, ip, gun.netPort);
	    });

	    // Store in gunNets
	    if (!gunNets[netId]) {
	      gunNets[netId] = newGuns;
	    } else {
	      var _gunNets$netId;

	      (_gunNets$netId = gunNets[netId]).push.apply(_gunNets$netId, newGuns);
	    }

	    return newGuns;
	  };

	  /*
	   * Peer-connects childMember's root node to parentMember's root.
	   *
	   * All childMember's nodes are re-tagged with parentMember's netId and the old child netId ceases to exist.
	   * If netId was already the same between groups, nothing happens.
	   *
	   * @param parentMember
	   * @param childMember
	   * @returns {*}
	   */
	  this.joinNets = function (childMember, parentMember) {
	    var _gunNets$root$netId;

	    // If already in the same net, just return the full list of nodes
	    if (parentMember.netId === childMember.netId) {
	      return gunNets[parentMember.netId];
	    }

	    // Move child net under parent
	    var root = gunNets[parentMember.netId][0];
	    var subChain = gunNets[childMember.netId];
	    if (!root || !subChain) {
	      throw new Error('What are you feeding me??? Either of the gun instances does not seem to be known to us!');
	    }

	    delete gunNets[childMember.netId];
	    addPeer(subChain[0], ip, root.netPort);
	    subChain.forEach(function (gun) {
	      gun.netId = root.netId;
	    });

	    (_gunNets$root$netId = gunNets[root.netId]).push.apply(_gunNets$root$netId, subChain);

	    return gunNets[root.netId];
	  };

	  this.describe = function () {
	    var mapping = _Object$keys(gunNets).map(function (key) {
	      var rows = gunNets[key].map(function (gun) {
	        var peers = _Object$keys(gun._.opt.peers).filter(function (key) {
	          return key.length > 2;
	        }).join(' ');
	        return '  :' + gun.netPort + ' ' + peers;
	      }).join('\n');
	      return key + ' ->\n' + rows;
	    }).join('\n');
	    return '== Net mapping / <NetId> -> [:<port> [<peers>, ...], ...] ==\n' + mapping;
	  };

	  this.close = function () {
	    _this.nets = null;
	    return _Promise.all(_Object$values(gunNets).map(function (net) {
	      return _Promise.all(net.map(async function (gun) {
	        await dropPeer(gun); // Drops all peers
	        await gun._.opt.web.close(); // And closes the web instance
	      }));
	    }));
	  };

	  this.nets = gunNets; // Purely for convenience
	}

	var util$1 = {
	  loadGunDepth: loadGunDepth,

	  GunNets: GunNets,

	  getHash: function getHash(str) {
	    var format = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'base64';

	    if (!str) {
	      return undefined;
	    }
	    var hash = browser$1('sha256');
	    hash.update(str);
	    return hash.digest(format);
	  },

	  timeoutPromise: function timeoutPromise(promise, timeout) {
	    return _Promise.race([promise, new _Promise(function (resolve) {
	      setTimeout(function () {
	        resolve();
	      }, timeout);
	    })]);
	  },
	  injectCss: function injectCss() {
	    var elementId = 'irisStyle';
	    if (document.getElementById(elementId)) {
	      return;
	    }
	    var sheet = document.createElement('style');
	    sheet.id = elementId;
	    sheet.innerHTML = '\n      .iris-identicon * {\n        box-sizing: border-box;\n      }\n\n      .iris-identicon {\n        vertical-align: middle;\n        border-radius: 50%;\n        text-align: center;\n        display: inline-block;\n        position: relative;\n        max-width: 100%;\n      }\n\n      .iris-distance {\n        z-index: 2;\n        position: absolute;\n        left:0%;\n        top:2px;\n        width: 100%;\n        text-align: right;\n        color: #fff;\n        text-shadow: 0 0 1px #000;\n        font-size: 75%;\n        line-height: 75%;\n        font-weight: bold;\n      }\n\n      .iris-pie {\n        border-radius: 50%;\n        position: absolute;\n        top: 0;\n        left: 0;\n        box-shadow: 0px 0px 0px 0px #82FF84;\n        padding-bottom: 100%;\n        max-width: 100%;\n        -webkit-transition: all 0.2s ease-in-out;\n        -moz-transition: all 0.2s ease-in-out;\n        transition: all 0.2s ease-in-out;\n      }\n\n      .iris-card {\n        padding: 10px;\n        background-color: #f7f7f7;\n        color: #777;\n        border: 1px solid #ddd;\n        display: flex;\n        flex-direction: row;\n        overflow: hidden;\n      }\n\n      .iris-card a {\n        -webkit-transition: color 150ms;\n        transition: color 150ms;\n        text-decoration: none;\n        color: #337ab7;\n      }\n\n      .iris-card a:hover, .iris-card a:active {\n        text-decoration: underline;\n        color: #23527c;\n      }\n\n      .iris-pos {\n        color: #3c763d;\n      }\n\n      .iris-neg {\n        color: #a94442;\n      }\n\n      .iris-identicon img {\n        position: absolute;\n        top: 0;\n        left: 0;\n        max-width: 100%;\n        border-radius: 50%;\n        border-color: transparent;\n        border-style: solid;\n      }';
	    document.body.appendChild(sheet);
	  },


	  isNode: isNode$2
	};

	// 19.1.2.1 Object.assign(target, source, ...)






	var $assign = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	var _objectAssign = !$assign || _fails(function () {
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var S = Symbol();
	  var K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function (k) { B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = _toObject(target);
	  var aLen = arguments.length;
	  var index = 1;
	  var getSymbols = _objectGops.f;
	  var isEnum = _objectPie.f;
	  while (aLen > index) {
	    var S = _iobject(arguments[index++]);
	    var keys = getSymbols ? _objectKeys(S).concat(getSymbols(S)) : _objectKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) {
	      key = keys[j++];
	      if (!_descriptors || isEnum.call(S, key)) T[key] = S[key];
	    }
	  } return T;
	} : $assign;

	// 19.1.3.1 Object.assign(target, source)


	_export(_export.S + _export.F, 'Object', { assign: _objectAssign });

	var assign = _core.Object.assign;

	var assign$1 = createCommonjsModule(function (module) {
	module.exports = { "default": assign, __esModule: true };
	});

	var _Object$assign = unwrapExports(assign$1);

	var pnglib = createCommonjsModule(function (module) {
	/**
	* A handy class to calculate color values.
	*
	* @version 1.0
	* @author Robert Eisele <robert@xarg.org>
	* @copyright Copyright (c) 2010, Robert Eisele
	* @link http://www.xarg.org/2010/03/generate-client-side-png-files-using-javascript/
	* @license http://www.opensource.org/licenses/bsd-license.php BSD License
	*
	*/

	(function() {

		// helper functions for that ctx
		function write(buffer, offs) {
			for (var i = 2; i < arguments.length; i++) {
				for (var j = 0; j < arguments[i].length; j++) {
					buffer[offs++] = arguments[i].charAt(j);
				}
			}
		}

		function byte2(w) {
			return String.fromCharCode((w >> 8) & 255, w & 255);
		}

		function byte4(w) {
			return String.fromCharCode((w >> 24) & 255, (w >> 16) & 255, (w >> 8) & 255, w & 255);
		}

		function byte2lsb(w) {
			return String.fromCharCode(w & 255, (w >> 8) & 255);
		}

		// modified from original source to support NPM
		var PNGlib = function(width,height,depth) {

			this.width   = width;
			this.height  = height;
			this.depth   = depth;

			// pixel data and row filter identifier size
			this.pix_size = height * (width + 1);

			// deflate header, pix_size, block headers, adler32 checksum
			this.data_size = 2 + this.pix_size + 5 * Math.floor((0xfffe + this.pix_size) / 0xffff) + 4;

			// offsets and sizes of Png chunks
			this.ihdr_offs = 0;									// IHDR offset and size
			this.ihdr_size = 4 + 4 + 13 + 4;
			this.plte_offs = this.ihdr_offs + this.ihdr_size;	// PLTE offset and size
			this.plte_size = 4 + 4 + 3 * depth + 4;
			this.trns_offs = this.plte_offs + this.plte_size;	// tRNS offset and size
			this.trns_size = 4 + 4 + depth + 4;
			this.idat_offs = this.trns_offs + this.trns_size;	// IDAT offset and size
			this.idat_size = 4 + 4 + this.data_size + 4;
			this.iend_offs = this.idat_offs + this.idat_size;	// IEND offset and size
			this.iend_size = 4 + 4 + 4;
			this.buffer_size  = this.iend_offs + this.iend_size;	// total PNG size

			this.buffer  = new Array();
			this.palette = new Object();
			this.pindex  = 0;

			var _crc32 = new Array();

			// initialize buffer with zero bytes
			for (var i = 0; i < this.buffer_size; i++) {
				this.buffer[i] = "\x00";
			}

			// initialize non-zero elements
			write(this.buffer, this.ihdr_offs, byte4(this.ihdr_size - 12), 'IHDR', byte4(width), byte4(height), "\x08\x03");
			write(this.buffer, this.plte_offs, byte4(this.plte_size - 12), 'PLTE');
			write(this.buffer, this.trns_offs, byte4(this.trns_size - 12), 'tRNS');
			write(this.buffer, this.idat_offs, byte4(this.idat_size - 12), 'IDAT');
			write(this.buffer, this.iend_offs, byte4(this.iend_size - 12), 'IEND');

			// initialize deflate header
			var header = ((8 + (7 << 4)) << 8) | (3 << 6);
			header+= 31 - (header % 31);

			write(this.buffer, this.idat_offs + 8, byte2(header));

			// initialize deflate block headers
			for (var i = 0; (i << 16) - 1 < this.pix_size; i++) {
				var size, bits;
				if (i + 0xffff < this.pix_size) {
					size = 0xffff;
					bits = "\x00";
				} else {
					size = this.pix_size - (i << 16) - i;
					bits = "\x01";
				}
				write(this.buffer, this.idat_offs + 8 + 2 + (i << 16) + (i << 2), bits, byte2lsb(size), byte2lsb(~size));
			}

			/* Create crc32 lookup table */
			for (var i = 0; i < 256; i++) {
				var c = i;
				for (var j = 0; j < 8; j++) {
					if (c & 1) {
						c = -306674912 ^ ((c >> 1) & 0x7fffffff);
					} else {
						c = (c >> 1) & 0x7fffffff;
					}
				}
				_crc32[i] = c;
			}

			// compute the index into a png for a given pixel
			this.index = function(x,y) {
				var i = y * (this.width + 1) + x + 1;
				var j = this.idat_offs + 8 + 2 + 5 * Math.floor((i / 0xffff) + 1) + i;
				return j;
			};

			// convert a color and build up the palette
			this.color = function(red, green, blue, alpha) {

				alpha = alpha >= 0 ? alpha : 255;
				var color = (((((alpha << 8) | red) << 8) | green) << 8) | blue;

				if (typeof this.palette[color] == "undefined") {
					if (this.pindex == this.depth) return "\x00";

					var ndx = this.plte_offs + 8 + 3 * this.pindex;

					this.buffer[ndx + 0] = String.fromCharCode(red);
					this.buffer[ndx + 1] = String.fromCharCode(green);
					this.buffer[ndx + 2] = String.fromCharCode(blue);
					this.buffer[this.trns_offs+8+this.pindex] = String.fromCharCode(alpha);

					this.palette[color] = String.fromCharCode(this.pindex++);
				}
				return this.palette[color];
			};

			// output a PNG string, Base64 encoded
			this.getBase64 = function() {

				var s = this.getDump();

				var ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
				var c1, c2, c3, e1, e2, e3, e4;
				var l = s.length;
				var i = 0;
				var r = "";

				do {
					c1 = s.charCodeAt(i);
					e1 = c1 >> 2;
					c2 = s.charCodeAt(i+1);
					e2 = ((c1 & 3) << 4) | (c2 >> 4);
					c3 = s.charCodeAt(i+2);
					if (l < i+2) { e3 = 64; } else { e3 = ((c2 & 0xf) << 2) | (c3 >> 6); }
					if (l < i+3) { e4 = 64; } else { e4 = c3 & 0x3f; }
					r+= ch.charAt(e1) + ch.charAt(e2) + ch.charAt(e3) + ch.charAt(e4);
				} while ((i+= 3) < l);
				return r;
			};

			// output a PNG string
			this.getDump = function() {

				// compute adler32 of output pixels + row filter bytes
				var BASE = 65521; /* largest prime smaller than 65536 */
				var NMAX = 5552;  /* NMAX is the largest n such that 255n(n+1)/2 + (n+1)(BASE-1) <= 2^32-1 */
				var s1 = 1;
				var s2 = 0;
				var n = NMAX;

				for (var y = 0; y < this.height; y++) {
					for (var x = -1; x < this.width; x++) {
						s1+= this.buffer[this.index(x, y)].charCodeAt(0);
						s2+= s1;
						if ((n-= 1) == 0) {
							s1%= BASE;
							s2%= BASE;
							n = NMAX;
						}
					}
				}
				s1%= BASE;
				s2%= BASE;
				write(this.buffer, this.idat_offs + this.idat_size - 8, byte4((s2 << 16) | s1));

				// compute crc32 of the PNG chunks
				function crc32(png, offs, size) {
					var crc = -1;
					for (var i = 4; i < size-4; i += 1) {
						crc = _crc32[(crc ^ png[offs+i].charCodeAt(0)) & 0xff] ^ ((crc >> 8) & 0x00ffffff);
					}
					write(png, offs+size-4, byte4(crc ^ -1));
				}

				crc32(this.buffer, this.ihdr_offs, this.ihdr_size);
				crc32(this.buffer, this.plte_offs, this.plte_size);
				crc32(this.buffer, this.trns_offs, this.trns_size);
				crc32(this.buffer, this.idat_offs, this.idat_size);
				crc32(this.buffer, this.iend_offs, this.iend_size);

				// convert PNG to string
				return "\x89PNG\r\n\x1a\n"+this.buffer.join('');
			};
		};

		// modified from original source to support NPM
		{
			module.exports = PNGlib;
		}
	})();
	});

	var identicon = createCommonjsModule(function (module) {
	/**
	 * Identicon.js 2.3.3
	 * http://github.com/stewartlord/identicon.js
	 *
	 * PNGLib required for PNG output
	 * http://www.xarg.org/download/pnglib.js
	 *
	 * Copyright 2018, Stewart Lord
	 * Released under the BSD license
	 * http://www.opensource.org/licenses/bsd-license.php
	 */

	(function() {
	    var PNGlib;
	    {
	        PNGlib = pnglib;
	    }

	    var Identicon = function(hash, options){
	        if (typeof(hash) !== 'string' || hash.length < 15) {
	            throw 'A hash of at least 15 characters is required.';
	        }

	        this.defaults = {
	            background: [240, 240, 240, 255],
	            margin:     0.08,
	            size:       64,
	            saturation: 0.7,
	            brightness: 0.5,
	            format:     'png'
	        };

	        this.options = typeof(options) === 'object' ? options : this.defaults;

	        // backward compatibility with old constructor (hash, size, margin)
	        if (typeof(arguments[1]) === 'number') { this.options.size   = arguments[1]; }
	        if (arguments[2])                      { this.options.margin = arguments[2]; }

	        this.hash        = hash;
	        this.background  = this.options.background || this.defaults.background;
	        this.size        = this.options.size       || this.defaults.size;
	        this.format      = this.options.format     || this.defaults.format;
	        this.margin      = this.options.margin !== undefined ? this.options.margin : this.defaults.margin;

	        // foreground defaults to last 7 chars as hue at 70% saturation, 50% brightness
	        var hue          = parseInt(this.hash.substr(-7), 16) / 0xfffffff;
	        var saturation   = this.options.saturation || this.defaults.saturation;
	        var brightness   = this.options.brightness || this.defaults.brightness;
	        this.foreground  = this.options.foreground || this.hsl2rgb(hue, saturation, brightness);
	    };

	    Identicon.prototype = {
	        background: null,
	        foreground: null,
	        hash:       null,
	        margin:     null,
	        size:       null,
	        format:     null,

	        image: function(){
	            return this.isSvg()
	                ? new Svg(this.size, this.foreground, this.background)
	                : new PNGlib(this.size, this.size, 256);
	        },

	        render: function(){
	            var image      = this.image(),
	                size       = this.size,
	                baseMargin = Math.floor(size * this.margin),
	                cell       = Math.floor((size - (baseMargin * 2)) / 5),
	                margin     = Math.floor((size - cell * 5) / 2),
	                bg         = image.color.apply(image, this.background),
	                fg         = image.color.apply(image, this.foreground);

	            // the first 15 characters of the hash control the pixels (even/odd)
	            // they are drawn down the middle first, then mirrored outwards
	            var i, color;
	            for (i = 0; i < 15; i++) {
	                color = parseInt(this.hash.charAt(i), 16) % 2 ? bg : fg;
	                if (i < 5) {
	                    this.rectangle(2 * cell + margin, i * cell + margin, cell, cell, color, image);
	                } else if (i < 10) {
	                    this.rectangle(1 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
	                    this.rectangle(3 * cell + margin, (i - 5) * cell + margin, cell, cell, color, image);
	                } else if (i < 15) {
	                    this.rectangle(0 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
	                    this.rectangle(4 * cell + margin, (i - 10) * cell + margin, cell, cell, color, image);
	                }
	            }

	            return image;
	        },

	        rectangle: function(x, y, w, h, color, image){
	            if (this.isSvg()) {
	                image.rectangles.push({x: x, y: y, w: w, h: h, color: color});
	            } else {
	                var i, j;
	                for (i = x; i < x + w; i++) {
	                    for (j = y; j < y + h; j++) {
	                        image.buffer[image.index(i, j)] = color;
	                    }
	                }
	            }
	        },

	        // adapted from: https://gist.github.com/aemkei/1325937
	        hsl2rgb: function(h, s, b){
	            h *= 6;
	            s = [
	                b += s *= b < .5 ? b : 1 - b,
	                b - h % 1 * s * 2,
	                b -= s *= 2,
	                b,
	                b + h % 1 * s,
	                b + s
	            ];

	            return [
	                s[ ~~h    % 6 ] * 255, // red
	                s[ (h|16) % 6 ] * 255, // green
	                s[ (h|8)  % 6 ] * 255  // blue
	            ];
	        },

	        toString: function(raw){
	            // backward compatibility with old toString, default to base64
	            if (raw) {
	                return this.render().getDump();
	            } else {
	                return this.render().getBase64();
	            }
	        },

	        isSvg: function(){
	            return this.format.match(/svg/i)
	        }
	    };

	    var Svg = function(size, foreground, background){
	        this.size       = size;
	        this.foreground = this.color.apply(this, foreground);
	        this.background = this.color.apply(this, background);
	        this.rectangles = [];
	    };

	    Svg.prototype = {
	        size:       null,
	        foreground: null,
	        background: null,
	        rectangles: null,

	        color: function(r, g, b, a){
	            var values = [r, g, b].map(Math.round);
	            values.push((a >= 0) && (a <= 255) ? a/255 : 1);
	            return 'rgba(' + values.join(',') + ')';
	        },

	        getDump: function(){
	          var i,
	                xml,
	                rect,
	                fg     = this.foreground,
	                bg     = this.background,
	                stroke = this.size * 0.005;

	            xml = "<svg xmlns='http://www.w3.org/2000/svg'"
	                + " width='" + this.size + "' height='" + this.size + "'"
	                + " style='background-color:" + bg + ";'>"
	                + "<g style='fill:" + fg + "; stroke:" + fg + "; stroke-width:" + stroke + ";'>";

	            for (i = 0; i < this.rectangles.length; i++) {
	                rect = this.rectangles[i];
	                if (rect.color == bg) continue;
	                xml += "<rect "
	                    + " x='"      + rect.x + "'"
	                    + " y='"      + rect.y + "'"
	                    + " width='"  + rect.w + "'"
	                    + " height='" + rect.h + "'"
	                    + "/>";
	            }
	            xml += "</g></svg>";

	            return xml;
	        },

	        getBase64: function(){
	            if ('function' === typeof btoa) {
	                return btoa(this.getDump());
	            } else if (Buffer) {
	                return new Buffer(this.getDump(), 'binary').toString('base64');
	            } else {
	                throw 'Cannot generate base64 output';
	            }
	        }
	    };

	    {
	        module.exports = Identicon;
	    }
	})();
	});

	var UNIQUE_ID_VALIDATORS = {
	  email: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
	  bitcoin: /^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/,
	  bitcoin_address: /^[13][a-km-zA-HJ-NP-Z0-9]{26,33}$/,
	  ip: /^(([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)\.){3}([1-9]?\d|1\d\d|2[0-5][0-5]|2[0-4]\d)$/,
	  ipv6: /^(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}$/,
	  gpg_fingerprint: null,
	  gpg_keyid: null,
	  google_oauth2: null,
	  tel: /^\d{7,}$/,
	  phone: /^\d{7,}$/,
	  keyID: null,
	  url: /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi,
	  account: /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i,
	  uuid: /[0-9a-f]{8}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{4}\-[0-9a-f]{12}/
	};

	/**
	* A simple key-value pair with helper functions.
	*
	* Constructor: new Attribute(value), new Attribute(type, value) or new Attribute({type, value})
	*/

	var Attribute = function () {
	  /**
	  * @param {string} a
	  * @param {string} b
	  */
	  function Attribute(a, b) {
	    _classCallCheck(this, Attribute);

	    if (typeof a === 'object' && typeof a.type === 'string' && typeof a.value === 'string') {
	      b = a.value;
	      a = a.type;
	    }
	    if (typeof a !== 'string') {
	      throw new Error('First param must be a string, got ' + (typeof a === 'undefined' ? 'undefined' : _typeof(a)) + ': ' + _JSON$stringify(a));
	    }
	    if (!a.length) {
	      throw new Error('First param string is empty');
	    }
	    if (b) {
	      if (typeof b !== 'string') {
	        throw new Error('Second parameter must be a string, got ' + (typeof b === 'undefined' ? 'undefined' : _typeof(b)) + ': ' + _JSON$stringify(b));
	      }
	      if (!b.length) {
	        throw new Error('Second param string is empty');
	      }
	      this.type = a;
	      this.value = b;
	    } else {
	      this.value = a;
	      var t = Attribute.guessTypeOf(this.value);
	      if (t) {
	        this.type = t;
	      } else {
	        throw new Error('Type of attribute was omitted and could not be guessed');
	      }
	    }
	  }

	  /**
	  * @returns {Attribute} uuid
	  */


	  Attribute.getUuid = function getUuid() {
	    var b = function b(a) {
	      return a ? (a ^ Math.random() * 16 >> a / 4).toString(16) : ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, b);
	    };
	    return new Attribute('uuid', b());
	  };

	  /**
	  * @returns {Object} an object with attribute types as keys and regex patterns as values
	  */


	  Attribute.getUniqueIdValidators = function getUniqueIdValidators() {
	    return UNIQUE_ID_VALIDATORS;
	  };

	  /**
	  * @param {string} type attribute type
	  * @returns {boolean} true if the attribute type is unique
	  */


	  Attribute.isUniqueType = function isUniqueType(type) {
	    return _Object$keys(UNIQUE_ID_VALIDATORS).indexOf(type) > -1;
	  };

	  /**
	  * @returns {boolean} true if the attribute type is unique
	  */


	  Attribute.prototype.isUniqueType = function isUniqueType() {
	    return Attribute.isUniqueType(this.type);
	  };

	  /**
	  * @param {string} value guess type of this attribute value
	  * @returns {string} type of attribute value or undefined
	  */


	  Attribute.guessTypeOf = function guessTypeOf(value) {
	    for (var key in UNIQUE_ID_VALIDATORS) {
	      if (value.match(UNIQUE_ID_VALIDATORS[key])) {
	        return key;
	      }
	    }
	  };

	  /**
	  * @param {Attribute} a
	  * @param {Attribute} b
	  * @returns {boolean} true if params are equal
	  */


	  Attribute.equals = function equals(a, b) {
	    return a.equals(b);
	  };

	  /**
	  * @param {Attribute} a attribute to compare to
	  * @returns {boolean} true if attribute matches param
	  */


	  Attribute.prototype.equals = function equals(a) {
	    return a && this.type === a.type && this.value === a.value;
	  };

	  /**
	  * @returns {string} uri - `${encodeURIComponent(this.value)}:${encodeURIComponent(this.type)}`
	  * @example
	  * user%20example.com:email
	  */


	  Attribute.prototype.uri = function uri() {
	    return encodeURIComponent(this.value) + ':' + encodeURIComponent(this.type);
	  };

	  /**
	  * Generate a visually recognizable representation of the attribute
	  * @param {object} options {width}
	  * @returns {HTMLElement} identicon div element
	  */


	  Attribute.prototype.identicon = function identicon$$1() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    options = _Object$assign({
	      width: 50,
	      showType: true
	    }, options);
	    util$1.injectCss(); // some other way that is not called on each identicon generation?

	    var div = document.createElement('div');
	    div.className = 'iris-identicon';
	    div.style.width = options.width + 'px';
	    div.style.height = options.width + 'px';

	    var img = document.createElement('img');
	    img.alt = '';
	    img.width = options.width;
	    img.height = options.width;
	    var hash = util$1.getHash(encodeURIComponent(this.type) + ':' + encodeURIComponent(this.value), 'hex');
	    var identicon$$1 = new identicon(hash, { width: options.width, format: 'svg' });
	    img.src = 'data:image/svg+xml;base64,' + identicon$$1.toString();

	    if (options.showType) {
	      var name = document.createElement('span');
	      name.className = 'iris-distance';
	      name.style.fontSize = options.width > 50 ? options.width / 4 + 'px' : '10px';
	      name.textContent = this.type.slice(0, 5);
	      div.appendChild(name);
	    }

	    div.appendChild(img);

	    return div;
	  };

	  return Attribute;
	}();

	var myKey = void 0;

	/**
	* Key management utils. Wraps GUN's SEA. https://gun.eco/docs/SEA
	*/

	var Key = function () {
	  function Key() {
	    _classCallCheck(this, Key);
	  }

	  /**
	  * Load default key from datadir/private.key on node.js or from local storage 'iris.myKey' in browser.
	  *
	  * If default key does not exist, it is generated.
	  * @param {string} datadir directory to find key from. In browser, localStorage is used instead.
	  * @returns {Promise<Object>} keypair object
	  */
	  Key.getDefault = async function getDefault() {
	    var datadir = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '.';
	    var keyfile = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'identifi.key';

	    if (myKey) {
	      return myKey;
	    }
	    if (util$1.isNode) {
	      var fs = require('fs');
	      var privKeyFile = datadir + '/' + keyfile;
	      if (fs.existsSync(privKeyFile)) {
	        var f = fs.readFileSync(privKeyFile, 'utf8');
	        myKey = Key.fromString(f);
	      } else {
	        var newKey = await Key.generate();
	        myKey = myKey || newKey; // eslint-disable-line require-atomic-updates
	        fs.writeFileSync(privKeyFile, Key.toString(myKey));
	        fs.chmodSync(privKeyFile, 400);
	      }
	      if (!myKey) {
	        throw new Error('loading default key failed - check ' + datadir + '/' + keyfile);
	      }
	    } else {
	      var str = window.localStorage.getItem('iris.myKey');
	      if (str) {
	        myKey = Key.fromString(str);
	      } else {
	        var _newKey = await Key.generate();
	        myKey = myKey || _newKey; // eslint-disable-line require-atomic-updates
	        window.localStorage.setItem('iris.myKey', Key.toString(myKey));
	      }
	      if (!myKey) {
	        throw new Error('loading default key failed - check localStorage iris.myKey');
	      }
	    }
	    return myKey;
	  };

	  /**
	  * Serialize key as JSON string
	  * @param {Object} key key to serialize
	  * @returns {String} JSON Web Key string
	  */


	  Key.toString = function toString(key) {
	    return _JSON$stringify(key);
	  };

	  /**
	  * Get keyID
	  * @param {Object} key key to get an id for. Currently just returns the public key string.
	  * @returns {String} public key string
	  */


	  Key.getId = function getId(key) {
	    if (!(key && key.pub)) {
	      throw new Error('missing param');
	    }
	    return key.pub; // hack until GUN supports lookups by keyID
	    //return util.getHash(key.pub);
	  };

	  /**
	  * Get a keypair from a JSON string.
	  * @param {String} str key JSON
	  * @returns {Object} Gun.SEA keypair object
	  */


	  Key.fromString = function fromString(str) {
	    return JSON.parse(str);
	  };

	  /**
	  * Generate a new keypair
	  * @returns {Promise<Object>} Gun.SEA keypair object
	  */


	  Key.generate = function generate() {
	    return Gun.SEA.pair();
	  };

	  /**
	  * Sign a message
	  * @param {String} msg message to sign
	  * @param {Object} pair signing keypair
	  * @returns {Promise<String>} signed message string
	  */


	  Key.sign = async function sign(msg, pair) {
	    var sig = await Gun.SEA.sign(msg, pair);
	    return 'a' + sig;
	  };

	  /**
	  * Verify a signed message
	  * @param {String} msg message to verify
	  * @param {Object} pubKey public key of the signer
	  * @returns {Promise<String>} signature string
	  */


	  Key.verify = function verify(msg, pubKey) {
	    return Gun.SEA.verify(msg.slice(1), pubKey);
	  };

	  return Key;
	}();

	var errorMsg = 'Invalid  message:';

	var ValidationError = function (_Error) {
	  _inherits(ValidationError, _Error);

	  function ValidationError() {
	    _classCallCheck(this, ValidationError);

	    return _possibleConstructorReturn(this, _Error.apply(this, arguments));
	  }

	  return ValidationError;
	}(Error);

	/**
	* Signed message object.
	*
	* Fields: signedData, signer (public key) and signature.
	*
	* signedData has an author, signer, type, time and optionally other fields.
	*
	* signature covers the utf8 string representation of signedData. Since messages are digitally signed, users only need to care about the message signer and not who relayed it or whose index it was found from.
	*
	* signer is the entity that verified its origin. In other words: message author and signer can be different entities, and only the signer needs to use Iris.
	*
	* For example, a crawler can import and sign other people's messages from Twitter. Only the users who trust the crawler will see the messages.
	*
	* "Rating" type messages, when added to an SocialNetwork, can add or remove Identities from the web of trust. Verification/unverification messages can add or remove Attributes from an Contact. Other types of messages such as social media "post" are just indexed by their author, recipient and time.
	*
	* Constructor: creates a message from the param obj.signedData that must contain at least the mandatory fields: author, recipient, type and time. You can use createRating() and createVerification() to automatically populate some of these fields and optionally sign the message.
	* @param obj
	*
	* @example
	* https://github.com/irislib/iris-lib/blob/master/__tests__/message.js
	*
	* Rating message:
	* {
	*   signedData: {
	*     author: {name:'Alice', key:'ABCD1234'},
	*     recipient: {name:'Bob', email:'bob@example.com'},
	*     type: 'rating',
	*     rating: 1,
	*     maxRating: 10,
	*     minRating: -10,
	*     text: 'Traded 1 BTC'
	*   },
	*   signer: 'ABCD1234',
	*   signature: '1234ABCD'
	* }
	*
	* Verification message:
	* {
	*   signedData: {
	*     author: {name:'Alice', key:'ABCD1234'},
	*     recipient: {
	*       name: 'Bob',
	*       email: ['bob@example.com', 'bob.saget@example.com'],
	*       bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa'
	*     },
	*     type: 'verification'
	*   },
	*   signer: 'ABCD1234',
	*   signature: '1234ABCD'
	* }
	*/


	var Message = function () {
	  function Message(obj) {
	    _classCallCheck(this, Message);

	    if (obj.signedData) {
	      this.signedData = obj.signedData;
	    }
	    if (obj.pubKey) {
	      this.pubKey = obj.pubKey;
	    }
	    if (obj.ipfsUri) {
	      this.ipfsUri = obj.ipfsUri;
	    }
	    if (obj.sig) {
	      if (typeof obj.sig !== 'string') {
	        throw new ValidationError('Message signature must be a string');
	      }
	      this.sig = obj.sig;
	      this.getHash();
	    }
	    this._validate();
	  }

	  Message._getArray = function _getArray(authorOrRecipient) {
	    var arr = [];
	    var keys = _Object$keys(authorOrRecipient);
	    for (var i = 0; i < keys.length; i++) {
	      var type = keys[i];
	      var value = authorOrRecipient[keys[i]];
	      if (typeof value === 'string') {
	        arr.push(new Attribute(type, value));
	      } else {
	        // array
	        for (var j = 0; j < value.length; j++) {
	          var elementValue = value[j];
	          arr.push(new Attribute(type, elementValue));
	        }
	      }
	    }
	    return arr;
	  };

	  Message._getIterable = function _getIterable(authorOrRecipient) {
	    var _ref;

	    return _ref = {}, _ref[_Symbol$iterator] = /*#__PURE__*/regenerator.mark(function _callee() {
	      var keys, i, type, value, j, elementValue;
	      return regenerator.wrap(function _callee$(_context) {
	        while (1) {
	          switch (_context.prev = _context.next) {
	            case 0:
	              keys = _Object$keys(authorOrRecipient);
	              i = 0;

	            case 2:
	              if (!(i < keys.length)) {
	                _context.next = 21;
	                break;
	              }

	              type = keys[i];
	              value = authorOrRecipient[keys[i]];

	              if (!(typeof value === 'string')) {
	                _context.next = 10;
	                break;
	              }

	              _context.next = 8;
	              return new Attribute(type, value);

	            case 8:
	              _context.next = 18;
	              break;

	            case 10:
	              j = 0;

	            case 11:
	              if (!(j < value.length)) {
	                _context.next = 18;
	                break;
	              }

	              elementValue = value[j];
	              _context.next = 15;
	              return new Attribute(type, elementValue);

	            case 15:
	              j++;
	              _context.next = 11;
	              break;

	            case 18:
	              i++;
	              _context.next = 2;
	              break;

	            case 21:
	            case 'end':
	              return _context.stop();
	          }
	        }
	      }, _callee, this);
	    }), _ref;
	  };

	  /**
	  * @returns {object} Javascript iterator over author attributes
	  */


	  Message.prototype.getAuthorIterable = function getAuthorIterable() {
	    return Message._getIterable(this.signedData.author);
	  };

	  /**
	  * @returns {object} Javascript iterator over recipient attributes
	  */


	  Message.prototype.getRecipientIterable = function getRecipientIterable() {
	    return Message._getIterable(this.signedData.recipient);
	  };

	  /**
	  * @returns {array} Array containing author attributes
	  */


	  Message.prototype.getAuthorArray = function getAuthorArray() {
	    return Message._getArray(this.signedData.author);
	  };

	  /**
	  * @returns {array} Array containing recipient attributes
	  */


	  Message.prototype.getRecipientArray = function getRecipientArray() {
	    return this.signedData.recipient ? Message._getArray(this.signedData.recipient) : [];
	  };

	  /**
	  * @returns {string} Message signer keyID, i.e. base64 hash of public key
	  */


	  Message.prototype.getSignerKeyID = function getSignerKeyID() {
	    return this.pubKey; // hack until gun supports keyID lookups
	    //return util.getHash(this.pubKey);
	  };

	  Message.prototype._validate = function _validate() {
	    if (!this.signedData) {
	      throw new ValidationError(errorMsg + ' Missing signedData');
	    }
	    if (typeof this.signedData !== 'object') {
	      throw new ValidationError(errorMsg + ' signedData must be an object');
	    }
	    var d = this.signedData;

	    if (!d.type) {
	      throw new ValidationError(errorMsg + ' Missing type definition');
	    }
	    if (!d.author) {
	      throw new ValidationError(errorMsg + ' Missing author');
	    }
	    if (typeof d.author !== 'object') {
	      throw new ValidationError(errorMsg + ' Author must be object');
	    }
	    if (Array.isArray(d.author)) {
	      throw new ValidationError(errorMsg + ' Author must not be an array');
	    }
	    if (_Object$keys(d.author).length === 0) {
	      throw new ValidationError(errorMsg + ' Author empty');
	    }
	    if (this.pubKey) {
	      this.signerKeyHash = this.getSignerKeyID();
	    }
	    for (var attr in d.author) {
	      var t = _typeof(d.author[attr]);
	      if (t !== 'string') {
	        if (Array.isArray(d.author[attr])) {
	          for (var i = 0; i < d.author[attr].length; i++) {
	            if (typeof d.author[attr][i] !== 'string') {
	              throw new ValidationError(errorMsg + ' Author attribute must be string, got ' + attr + ': [' + d.author[attr][i] + ']');
	            }
	            if (d.author[attr][i].length === 0) {
	              throw new ValidationError(errorMsg + ' author ' + attr + ' in array[' + i + '] is empty');
	            }
	          }
	        } else {
	          throw new ValidationError(errorMsg + ' Author attribute must be string or array, got ' + attr + ': ' + d.author[attr]);
	        }
	      }
	      if (attr === 'keyID') {
	        if (t !== 'string') {
	          throw new ValidationError(errorMsg + ' Author keyID must be string, got ' + t);
	        }
	        if (this.signerKeyHash && d.author[attr] !== this.signerKeyHash) {
	          throw new ValidationError(errorMsg + ' If message has a keyID author, it must be signed by the same key');
	        }
	      }
	    }
	    if (d.recipient) {
	      if (typeof d.recipient !== 'object') {
	        throw new ValidationError(errorMsg + ' Recipient must be object');
	      }
	      if (Array.isArray(d.recipient)) {
	        throw new ValidationError(errorMsg + ' Recipient must not be an array');
	      }
	      if (_Object$keys(d.recipient).length === 0) {
	        throw new ValidationError(errorMsg + ' Recipient empty');
	      }
	      for (var _attr in d.recipient) {
	        var _t = _typeof(d.recipient[_attr]);
	        if (_t !== 'string') {
	          if (Array.isArray(d.recipient[_attr])) {
	            for (var _i = 0; _i < d.recipient[_attr].length; _i++) {
	              if (typeof d.recipient[_attr][_i] !== 'string') {
	                throw new ValidationError(errorMsg + ' Recipient attribute must be string, got ' + _attr + ': [' + d.recipient[_attr][_i] + ']');
	              }
	              if (d.recipient[_attr][_i].length === 0) {
	                throw new ValidationError(errorMsg + ' recipient ' + _attr + ' in array[' + _i + '] is empty');
	              }
	            }
	          } else {
	            throw new ValidationError(errorMsg + ' Recipient attribute must be string or array, got ' + _attr + ': ' + d.recipient[_attr]);
	          }
	        }
	      }
	    }
	    if (!(d.time || d.timestamp)) {
	      throw new ValidationError(errorMsg + ' Missing time field');
	    }

	    if (!Date.parse(d.time || d.timestamp)) {
	      throw new ValidationError(errorMsg + ' Invalid time field');
	    }

	    if (d.type === 'rating') {
	      if (isNaN(d.rating)) {
	        throw new ValidationError(errorMsg + ' Invalid rating');
	      }
	      if (isNaN(d.maxRating)) {
	        throw new ValidationError(errorMsg + ' Invalid maxRating');
	      }
	      if (isNaN(d.minRating)) {
	        throw new ValidationError(errorMsg + ' Invalid minRating');
	      }
	      if (d.rating > d.maxRating) {
	        throw new ValidationError(errorMsg + ' Rating is above maxRating');
	      }
	      if (d.rating < d.minRating) {
	        throw new ValidationError(errorMsg + ' Rating is below minRating');
	      }
	      if (typeof d.context !== 'string' || !d.context.length) {
	        throw new ValidationError(errorMsg + ' Rating messages must have a context field');
	      }
	    }

	    if (d.type === 'verification' || d.type === 'unverification') {
	      if (d.recipient.length < 2) {
	        throw new ValidationError(errorMsg + ' At least 2 recipient attributes are needed for a connection / disconnection. Got: ' + d.recipient);
	      }
	    }

	    return true;
	  };

	  /**
	  * @returns {boolean} true if message has a positive rating
	  */


	  Message.prototype.isPositive = function isPositive() {
	    return this.signedData.type === 'rating' && this.signedData.rating > (this.signedData.maxRating + this.signedData.minRating) / 2;
	  };

	  /**
	  * @returns {boolean} true if message has a negative rating
	  */


	  Message.prototype.isNegative = function isNegative() {
	    return this.signedData.type === 'rating' && this.signedData.rating < (this.signedData.maxRating + this.signedData.minRating) / 2;
	  };

	  /**
	  * @returns {boolean} true if message has a neutral rating
	  */


	  Message.prototype.isNeutral = function isNeutral() {
	    return this.signedData.type === 'rating' && this.signedData.rating === (this.signedData.maxRating + this.signedData.minRating) / 2;
	  };

	  /**
	  * @param {Object} key Gun.SEA keypair to sign the message with
	  */


	  Message.prototype.sign = async function sign(key) {
	    this.sig = await Key.sign(this.signedData, key);
	    this.pubKey = key.pub;
	    this.getHash();
	    return true;
	  };

	  /**
	  * Create an iris message. Message time is automatically set. If signingKey is specified and author omitted, signingKey will be used as author.
	  * @param {Object} signedData message data object including author, recipient and other possible attributes
	  * @param {Object} signingKey optionally, you can set the key to sign the message with
	  * @returns {Promise<Message>}  message
	  */


	  Message.create = async function create(signedData, signingKey) {
	    if (!signedData.author && signingKey) {
	      signedData.author = { keyID: Key.getId(signingKey) };
	    }
	    signedData.time = signedData.time || new Date().toISOString();
	    var m = new Message({ signedData: signedData });
	    if (signingKey) {
	      await m.sign(signingKey);
	    }
	    return m;
	  };

	  /**
	  * Create an  verification message. Message signedData's type and time are automatically set. Recipient must be set. If signingKey is specified and author omitted, signingKey will be used as author.
	  * @returns {Promise<Object>} message object promise
	  */


	  Message.createVerification = function createVerification(signedData, signingKey) {
	    signedData.type = 'verification';
	    return Message.create(signedData, signingKey);
	  };

	  /**
	  * Create an  rating message. Message signedData's type, maxRating, minRating, time and context are set automatically. Recipient and rating must be set. If signingKey is specified and author omitted, signingKey will be used as author.
	  * @returns {Promise<Object>} message object promise
	  */


	  Message.createRating = function createRating(signedData, signingKey) {
	    signedData.type = 'rating';
	    signedData.context = signedData.context || 'iris';
	    signedData.maxRating = signedData.maxRating || 10;
	    signedData.minRating = signedData.minRating || -10;
	    return Message.create(signedData, signingKey);
	  };

	  /**
	  * @param {Index} index index to look up the message author from
	  * @returns {Contact} message author identity
	  */


	  Message.prototype.getAuthor = function getAuthor(index) {
	    for (var _iterator = this.getAuthorIterable(), _isArray = Array.isArray(_iterator), _i2 = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
	      var _ref2;

	      if (_isArray) {
	        if (_i2 >= _iterator.length) break;
	        _ref2 = _iterator[_i2++];
	      } else {
	        _i2 = _iterator.next();
	        if (_i2.done) break;
	        _ref2 = _i2.value;
	      }

	      var a = _ref2;

	      if (a.isUniqueType()) {
	        return index.getContacts(a);
	      }
	    }
	  };

	  /**
	  * @param {Index} index index to look up the message recipient from
	  * @returns {Contact} message recipient identity or undefined
	  */


	  Message.prototype.getRecipient = function getRecipient(index) {
	    if (!this.signedData.recipient) {
	      return undefined;
	    }
	    for (var _iterator2 = this.getRecipientIterable(), _isArray2 = Array.isArray(_iterator2), _i3 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
	      var _ref3;

	      if (_isArray2) {
	        if (_i3 >= _iterator2.length) break;
	        _ref3 = _iterator2[_i3++];
	      } else {
	        _i3 = _iterator2.next();
	        if (_i3.done) break;
	        _ref3 = _i3.value;
	      }

	      var a = _ref3;

	      if (a.isUniqueType()) {
	        return index.getContacts(a);
	      }
	    }
	  };

	  /**
	  * @returns {string} base64 sha256 hash of message
	  */


	  Message.prototype.getHash = function getHash() {
	    if (this.sig && !this.hash) {
	      this.hash = util$1.getHash(this.sig);
	    }
	    return this.hash;
	  };

	  Message.prototype.getId = function getId() {
	    return this.getHash();
	  };

	  Message.fromSig = async function fromSig(obj) {
	    if (!obj.sig) {
	      throw new Error('Missing signature in object:', obj);
	    }
	    if (!obj.pubKey) {
	      throw new Error('Missing pubKey in object:');
	    }
	    var signedData = await Key.verify(obj.sig, obj.pubKey);
	    var o = { signedData: signedData, sig: obj.sig, pubKey: obj.pubKey };
	    return new Message(o);
	  };

	  /**
	  * @return {boolean} true if message signature is valid. Otherwise throws ValidationError.
	  */


	  Message.prototype.verify = async function verify() {
	    if (!this.pubKey) {
	      throw new ValidationError(errorMsg + ' Message has no .pubKey');
	    }
	    if (!this.sig) {
	      throw new ValidationError(errorMsg + ' Message has no .sig');
	    }
	    this.signedData = await Key.verify(this.sig, this.pubKey);
	    if (!this.signedData) {
	      throw new ValidationError(errorMsg + ' Invalid signature');
	    }
	    if (this.hash) {
	      if (this.hash !== util$1.getHash(this.sig)) {
	        throw new ValidationError(errorMsg + ' Invalid message hash');
	      }
	    } else {
	      this.getHash();
	    }
	    return true;
	  };

	  /**
	  *
	  */


	  Message.prototype.saveToIpfs = async function saveToIpfs(ipfs) {
	    var s = this.toString();
	    var r = await ipfs.add(ipfs.types.Buffer.from(s));
	    if (r.length) {
	      this.ipfsUri = r[0].hash;
	    }
	    return this.ipfsUri;
	  };

	  /**
	  *
	  */


	  Message.loadFromIpfs = async function loadFromIpfs(ipfs, uri) {
	    var f = await ipfs.cat(uri);
	    var s = ipfs.types.Buffer.from(f).toString('utf8');
	    try {
	      return Message.fromString(s);
	    } catch (e) {
	      console.log('loading message from ipfs failed');
	      return _Promise.reject();
	    }
	  };

	  /**
	  * @returns {string} JSON string of signature and public key
	  */


	  Message.prototype.serialize = function serialize() {
	    return { sig: this.sig, pubKey: this.pubKey };
	  };

	  Message.prototype.toString = function toString() {
	    return _JSON$stringify(this.serialize());
	  };

	  /**
	  * @returns {Promise<Message>} message from JSON string produced by toString
	  */


	  Message.deserialize = async function deserialize(s) {
	    return Message.fromSig(s);
	  };

	  Message.fromString = async function fromString(s) {
	    return Message.fromSig(JSON.parse(s));
	  };

	  /**
	  *
	  */


	  Message.setReaction = function setReaction(gun, msg, reaction) {
	    gun.get('reactions').get(msg.getHash()).put(reaction);
	    gun.get('reactions').get(msg.getHash()).put(reaction);
	    gun.get('messagesByHash').get(msg.getHash()).get('reactions').get(this.rootContact.value).put(reaction);
	    gun.get('messagesByHash').get(msg.getHash()).get('reactions').get(this.rootContact.value).put(reaction);
	  };

	  return Message;
	}();

	/**
	* An Iris Contact, such as person, organization or group. More abstractly speaking: an Identity.
	*
	* Usually you don't create Contacts yourself, but get them
	* from SocialNetwork methods such as get() and search().
	*/

	var Contact = function () {
	  /**
	  * @param {Object} gun node where the Contact data lives
	  */
	  function Contact(gun, linkTo) {
	    _classCallCheck(this, Contact);

	    this.gun = gun;
	    this.linkTo = linkTo;
	  }

	  Contact.create = function create(gun, data, index) {
	    if (!data.linkTo && !data.attrs) {
	      throw new Error('You must specify either data.linkTo or data.attrs');
	    }
	    if (data.linkTo && !data.attrs) {
	      var linkTo = new Attribute(data.linkTo);
	      data.attrs = {};
	      if (!Object.prototype.hasOwnProperty.call(data.attrs, linkTo.uri())) {
	        data.attrs[linkTo.uri()] = linkTo;
	      }
	    } else {
	      data.linkTo = Contact.getLinkTo(data.attrs);
	    }
	    var uri = data.linkTo.uri();
	    var attrs = gun.top(uri + '/attrs').put(data.attrs);
	    delete data['attrs'];
	    gun.put(data);
	    gun.get('attrs').put(attrs);
	    return new Contact(gun, uri, index);
	  };

	  Contact.getLinkTo = function getLinkTo(attrs) {
	    var mva = Contact.getMostVerifiedAttributes(attrs);
	    var keys = _Object$keys(mva);
	    var linkTo = void 0;
	    for (var i = 0; i < keys.length; i++) {
	      if (keys[i] === 'keyID') {
	        linkTo = mva[keys[i]].attribute;
	        break;
	      } else if (Attribute.isUniqueType(keys[i])) {
	        linkTo = mva[keys[i]].attribute;
	      }
	    }
	    return linkTo;
	  };

	  Contact.getMostVerifiedAttributes = function getMostVerifiedAttributes(attrs) {
	    var mostVerifiedAttributes = {};
	    _Object$keys(attrs).forEach(function (k) {
	      var a = attrs[k];
	      var keyExists = _Object$keys(mostVerifiedAttributes).indexOf(a.type) > -1;
	      a.verifications = isNaN(a.verifications) ? 1 : a.verifications;
	      a.unverifications = isNaN(a.unverifications) ? 0 : a.unverifications;
	      if (a.verifications * 2 > a.unverifications * 3 && (!keyExists || a.verifications - a.unverifications > mostVerifiedAttributes[a.type].verificationScore)) {
	        mostVerifiedAttributes[a.type] = {
	          attribute: a,
	          verificationScore: a.verifications - a.unverifications
	        };
	        if (a.verified) {
	          mostVerifiedAttributes[a.type].verified = true;
	        }
	      }
	    });
	    return mostVerifiedAttributes;
	  };

	  Contact.getAttrs = async function getAttrs(identity) {
	    var attrs = await util$1.loadGunDepth(identity.get('attrs'), 2);
	    if (attrs && attrs['_'] !== undefined) {
	      delete attrs['_'];
	    }
	    return attrs || {};
	  };

	  Contact.prototype.getId = function getId() {
	    return this.linkTo.value;
	  };

	  /**
	  * Get sent Messages
	  * @param {Object} index
	  * @param {Object} options
	  */


	  Contact.prototype.sent = function sent(index, options) {
	    index._getSentMsgs(this, options);
	  };

	  /**
	  * Get received Messages
	  * @param {Object} index
	  * @param {Object} options
	  */


	  Contact.prototype.received = function received(index, options) {
	    index._getReceivedMsgs(this, options);
	  };

	  /**
	  * @param {string} attribute attribute type
	  * @returns {string} most verified value of the param type
	  */


	  Contact.prototype.verified = async function verified(attribute) {
	    var attrs = await Contact.getAttrs(this.gun).then();
	    var mva = Contact.getMostVerifiedAttributes(attrs);
	    return Object.prototype.hasOwnProperty.call(mva, attribute) ? mva[attribute].attribute.value : undefined;
	  };

	  /**
	  * @param {Object} ipfs (optional) an IPFS instance that is used to fetch images
	  * @returns {HTMLElement} profile card html element describing the identity
	  */


	  Contact.prototype.profileCard = function profileCard(ipfs) {
	    var _this = this;

	    var card = document.createElement('div');
	    card.className = 'iris-card';

	    var identicon$$1 = this.identicon({ width: 60, ipfs: ipfs });
	    identicon$$1.style.order = 1;
	    identicon$$1.style.flexShrink = 0;
	    identicon$$1.style.marginRight = '15px';

	    var details = document.createElement('div');
	    details.style.padding = '5px';
	    details.style.order = 2;
	    details.style.flexGrow = 1;

	    var linkEl = document.createElement('span');
	    var links = document.createElement('small');
	    card.appendChild(identicon$$1);
	    card.appendChild(details);
	    details.appendChild(linkEl);
	    details.appendChild(links);

	    this.gun.on(async function (data) {
	      if (!data) {
	        return;
	      }
	      var attrs = await Contact.getAttrs(_this.gun);
	      var linkTo = await _this.gun.get('linkTo').then();
	      var link = 'https://iris.to/#/identities/' + linkTo.type + '/' + linkTo.value;
	      var mva = Contact.getMostVerifiedAttributes(attrs);
	      linkEl.innerHTML = '<a href="' + link + '">' + (mva.type && mva.type.attribute.value || mva.nickname && mva.nickname.attribute.value || linkTo.type + ':' + linkTo.value) + '</a><br>';
	      linkEl.innerHTML += '<small>Received: <span class="iris-pos">+' + (data.receivedPositive || 0) + '</span> / <span class="iris-neg">-' + (data.receivedNegative || 0) + '</span></small><br>';
	      links.innerHTML = '';
	      _Object$keys(attrs).forEach(function (k) {
	        var a = attrs[k];
	        if (a.link) {
	          links.innerHTML += a.type + ': <a href="' + a.link + '">' + a.value + '</a> ';
	        }
	      });
	    });

	    /*
	    const template = ```
	    <tr ng-repeat="result in ids.list" id="result{$index}" ng-hide="!result.linkTo" ui-sref="identities.show({ type: result.linkTo.type, value: result.linkTo.value })" class="search-result-row" ng-class="{active: result.active}">
	      <td class="gravatar-col"><identicon id="result" border="3" width="46" positive-score="result.pos" negative-score="result.neg"></identicon></td>
	      <td>
	        <span ng-if="result.distance == 0" class="label label-default pull-right">rootContact</span>
	        <span ng-if="result.distance > 0" ng-bind="result.distance | ordinal" class="label label-default pull-right"></span>
	        <a ng-bind-html="result.name|highlight:query.term" ui-sref="identities.show({ type: result.linkTo.type, value: result.linkTo.value })"></a>
	        <small ng-if="!result.name" class="list-group-item-text">
	          <span ng-bind-html="result[0][0]|highlight:query.term"></span>
	        </small><br>
	        <small>
	          <span ng-if="result.nickname && result.name != result.nickname" ng-bind-html="result.nickname|highlight:query.term" class="mar-right10"></span>
	          <span ng-if="result.email" class="mar-right10">
	            <span class="glyphicon glyphicon-envelope"></span> <span ng-bind-html="result.email|highlight:query.term"></span>
	          </span>
	          <span ng-if="result.facebook" class="mar-right10">
	            <span class="fa fa-facebook"></span> <span ng-bind-html="result.facebook|highlight:query.term"></span>
	          </span>
	          <span ng-if="result.twitter" class="mar-right10">
	            <span class="fa fa-twitter"></span> <span ng-bind-html="result.twitter|highlight:query.term"></span>
	          </span>
	          <span ng-if="result.googlePlus" class="mar-right10">
	            <span class="fa fa-google-plus"></span> <span ng-bind-html="result.googlePlus|highlight:query.term"></span>
	          </span>
	          <span ng-if="result.bitcoin" class="mar-right10">
	            <span class="fa fa-bitcoin"></span> <span ng-bind-html="result.bitcoin|highlight:query.term"></span>
	          </span>
	        </small>
	      </td>
	    </tr>
	    ```;*/
	    return card;
	  };

	  /**
	  * Appends an identity search widget to the given HTMLElement
	  * @param {HTMLElement} parentElement element where the search widget is added and event listener attached
	  * @param {Index} index index root to use for search
	  */


	  Contact.appendSearchWidget = function appendSearchWidget(parentElement, index) {
	    var form = document.createElement('form');

	    var input = document.createElement('input');
	    input.type = 'text';
	    input.placeholder = 'Search';
	    input.id = 'irisSearchInput';
	    form.innerHTML += '<div id="irisSearchResults"></div>';

	    var searchResults = document.createElement('div');

	    parentElement.appendChild(form);
	    form.appendChild(input);
	    form.appendChild(searchResults);
	    input.addEventListener('keyup', async function () {
	      var r = await index.search(input.value);
	      searchResults.innerHTML = '';
	      r.sort(function (a, b) {
	        return a.trustDistance - b.trustDistance;
	      });
	      r.forEach(function (i) {
	        searchResults.appendChild(i.profileCard());
	      });
	    });

	    return form;
	  };

	  Contact._ordinal = function _ordinal(n) {
	    if (n === 0) {
	      return '';
	    }
	    var s = ['th', 'st', 'nd', 'rd'];
	    var v = n % 100;
	    return n + (s[(v - 20) % 10] || s[v] || s[0]);
	  };

	  /**
	  * @param {Object} options {width: 50, border: 4, showDistance: true, ipfs: null, outerGlow: false}
	  * @returns {HTMLElement} identicon element that can be appended to DOM
	  */


	  Contact.prototype.identicon = function identicon$$1() {
	    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	    options = _Object$assign({
	      width: 50,
	      border: 4,
	      showDistance: true,
	      outerGlow: false,
	      ipfs: null
	    }, options);
	    util$1.injectCss(); // some other way that is not called on each identicon generation?
	    var identicon$$1 = document.createElement('div');
	    identicon$$1.className = 'iris-identicon';
	    identicon$$1.style.width = options.width + 'px';
	    identicon$$1.style.height = options.width + 'px';

	    var pie = document.createElement('div');
	    pie.className = 'iris-pie';
	    pie.style.width = options.width + 'px';

	    var img = document.createElement('img');
	    img.alt = '';
	    img.width = options.width;
	    img.height = options.width;
	    img.style.borderWidth = options.border + 'px';

	    var distance = void 0;
	    if (options.border) {
	      distance = document.createElement('span');
	      distance.className = 'iris-distance';
	      distance.style.fontSize = options.width > 50 ? options.width / 4 + 'px' : '10px';
	      identicon$$1.appendChild(distance);
	    }
	    identicon$$1.appendChild(pie);
	    identicon$$1.appendChild(img);

	    function setPie(data) {
	      if (!data) {
	        return;
	      }
	      // Define colors etc
	      var bgColor = 'rgba(0,0,0,0.2)';
	      var bgImage = 'none';
	      var transform = '';
	      if (options.outerGlow) {
	        var boxShadow = '0px 0px 0px 0px #82FF84';
	        if (data.receivedPositive > data.receivedNegative * 20) {
	          boxShadow = '0px 0px ' + options.border * data.receivedPositive / 50 + 'px 0px #82FF84';
	        } else if (data.receivedPositive < data.receivedNegative * 3) {
	          boxShadow = '0px 0px ' + options.border * data.receivedNegative / 10 + 'px 0px #BF0400';
	        }
	        pie.style.boxShadow = boxShadow;
	      }
	      if (data.receivedPositive + data.receivedNegative > 0) {
	        if (data.receivedPositive > data.receivedNegative) {
	          transform = 'rotate(' + (-data.receivedPositive / (data.receivedPositive + data.receivedNegative) * 360 - 180) / 2 + 'deg)';
	          bgColor = '#A94442';
	          bgImage = 'linear-gradient(' + data.receivedPositive / (data.receivedPositive + data.receivedNegative) * 360 + 'deg, transparent 50%, #3C763D 50%), linear-gradient(0deg, #3C763D 50%, transparent 50%)';
	        } else {
	          transform = 'rotate(' + ((-data.receivedNegative / (data.receivedPositive + data.receivedNegative) * 360 - 180) / 2 + 180) + 'deg)';
	          bgColor = '#3C763D';
	          bgImage = 'linear-gradient(' + data.receivedNegative / (data.receivedPositive + data.receivedNegative) * 360 + 'deg, transparent 50%, #A94442 50%), linear-gradient(0deg, #A94442 50%, transparent 50%)';
	        }
	      }

	      pie.style.backgroundColor = bgColor;
	      pie.style.backgroundImage = bgImage;
	      pie.style.transform = transform;
	      pie.style.opacity = (data.receivedPositive + data.receivedNegative) / 10 * 0.5 + 0.35;

	      if (options.showDistance) {
	        distance.textContent = typeof data.trustDistance === 'number' ? Contact._ordinal(data.trustDistance) : '\u2715';
	      }
	    }

	    function setIdenticonImg(data) {
	      var hash = util$1.getHash(encodeURIComponent(data.type) + ':' + encodeURIComponent(data.value), 'hex');
	      var identiconImg = new identicon(hash, { width: options.width, format: 'svg' });
	      img.src = img.src || 'data:image/svg+xml;base64,' + identiconImg.toString();
	    }

	    if (this.linkTo) {
	      setIdenticonImg(this.linkTo);
	    } else {
	      this.gun.get('linkTo').on(setIdenticonImg);
	    }

	    this.gun.on(setPie);

	    if (options.ipfs) {
	      Contact.getAttrs(this.gun).then(function (attrs) {
	        var mva = Contact.getMostVerifiedAttributes(attrs);
	        if (mva.profilePhoto) {
	          var go = function go() {
	            options.ipfs.cat(mva.profilePhoto.attribute.value).then(function (file) {
	              var f = options.ipfs.types.Buffer.from(file).toString('base64');
	              img.src = 'data:image;base64,' + f;
	            });
	          };
	          options.ipfs.isOnline() ? go() : options.ipfs.on('ready', go);
	        }
	      });
	    }

	    return identicon$$1;
	  };

	  Contact.prototype.serialize = function serialize() {
	    return this.gun;
	  };

	  Contact.deserialize = function deserialize(data, opt) {
	    var linkTo = new Attribute({ type: 'uuid', value: opt.id });
	    return new Contact(opt.gun, linkTo);
	  };

	  return Contact;
	}();

	// 20.1.2.4 Number.isNaN(number)


	_export(_export.S, 'Number', {
	  isNaN: function isNaN(number) {
	    // eslint-disable-next-line no-self-compare
	    return number != number;
	  }
	});

	var isNan = _core.Number.isNaN;

	var isNan$1 = createCommonjsModule(function (module) {
	module.exports = { "default": isNan, __esModule: true };
	});

	var _Number$isNaN = unwrapExports(isNan$1);

	var _stringWs = '\x09\x0A\x0B\x0C\x0D\x20\xA0\u1680\u180E\u2000\u2001\u2002\u2003' +
	  '\u2004\u2005\u2006\u2007\u2008\u2009\u200A\u202F\u205F\u3000\u2028\u2029\uFEFF';

	var space = '[' + _stringWs + ']';
	var non = '\u200b\u0085';
	var ltrim = RegExp('^' + space + space + '*');
	var rtrim = RegExp(space + space + '*$');

	var exporter = function (KEY, exec, ALIAS) {
	  var exp = {};
	  var FORCE = _fails(function () {
	    return !!_stringWs[KEY]() || non[KEY]() != non;
	  });
	  var fn = exp[KEY] = FORCE ? exec(trim) : _stringWs[KEY];
	  if (ALIAS) exp[ALIAS] = fn;
	  _export(_export.P + _export.F * FORCE, 'String', exp);
	};

	// 1 -> String#trimLeft
	// 2 -> String#trimRight
	// 3 -> String#trim
	var trim = exporter.trim = function (string, TYPE) {
	  string = String(_defined(string));
	  if (TYPE & 1) string = string.replace(ltrim, '');
	  if (TYPE & 2) string = string.replace(rtrim, '');
	  return string;
	};

	var _stringTrim = exporter;

	var $parseInt = _global.parseInt;
	var $trim = _stringTrim.trim;

	var hex = /^[-+]?0[xX]/;

	var _parseInt = $parseInt(_stringWs + '08') !== 8 || $parseInt(_stringWs + '0x16') !== 22 ? function parseInt(str, radix) {
	  var string = $trim(String(str), 3);
	  return $parseInt(string, (radix >>> 0) || (hex.test(string) ? 16 : 10));
	} : $parseInt;

	// 20.1.2.13 Number.parseInt(string, radix)
	_export(_export.S + _export.F * (Number.parseInt != _parseInt), 'Number', { parseInt: _parseInt });

	var _parseInt$1 = _core.Number.parseInt;

	var _parseInt$2 = createCommonjsModule(function (module) {
	module.exports = { "default": _parseInt$1, __esModule: true };
	});

	var _Number$parseInt = unwrapExports(_parseInt$2);

	/**
	* Private communication channel between two or more participants. Can be used
	* independently of other Iris stuff.
	*
	* Messages are encrypted and chat ids obfuscated, but it is possible to guess
	* who are communicating with each other by looking at Gun timestamps and subscriptions.
	*
	* options.onMessage callback is not guaranteed to receive messages ordered by timestamp.
	* You should sort them in the presentation layer.
	*
	* @param {Object} options {key, gun, onMessage, participants}
	* @example https://github.com/irislib/iris-lib/blob/master/__tests__/chat.js
	*/

	var Chat = function () {
	  function Chat(options) {
	    _classCallCheck(this, Chat);

	    this.key = options.key;
	    this.gun = options.gun;
	    this.user = this.gun.user();
	    this.user.auth(this.key);
	    this.user.put({ epub: this.key.epub });
	    this.secrets = {}; // maps participant public key to shared secret
	    this.ourSecretChatIds = {}; // maps participant public key to our secret chat id
	    this.theirSecretChatIds = {}; // maps participant public key to their secret chat id
	    this.onMessage = options.onMessage;

	    if (typeof options.participants === 'string') {
	      this.addPub(options.participants);
	    } else if (Array.isArray(options.participants)) {
	      for (var i = 0; i < options.participants.length; i++) {
	        if (typeof options.participants[i] === 'string') {
	          this.addPub(options.participants[i]);
	        } else {
	          console.log('participant public key must be string, got', _typeof(options.participants[i]), options.participants[i]);
	        }
	      }
	    }
	  }

	  Chat.prototype.getSecret = async function getSecret(pub) {
	    if (!this.secrets[pub]) {
	      var epub = await this.gun.user(pub).get('epub').once().then();
	      this.secrets[pub] = await Gun.SEA.secret(epub, this.key);
	    }
	    return this.secrets[pub];
	  };

	  /**
	  *
	  */


	  Chat.getOurSecretChatId = async function getOurSecretChatId(gun, pub, pair) {
	    var epub = await gun.user(pub).get('epub').once().then();
	    var secret = await Gun.SEA.secret(epub, pair);
	    return Gun.SEA.work(secret + pub, null, null, { name: 'SHA-256' });
	  };

	  /**
	  *
	  */


	  Chat.getTheirSecretChatId = async function getTheirSecretChatId(gun, pub, pair) {
	    var epub = await gun.user(pub).get('epub').once().then();
	    var secret = await Gun.SEA.secret(epub, pair);
	    return Gun.SEA.work(secret + pair.pub, null, null, { name: 'SHA-256' });
	  };

	  /**
	  * Return a list of public keys that you have initiated a chat with or replied to.
	  * (Chats that are initiated by others and unreplied by you don't show up, because
	  * this method doesn't know where to look for them. Use socialNetwork.getChats() to listen to new chats from friends.)
	  * @param {Object} gun user.authed gun instance
	  * @param {Object} keypair SEA keypair that the gun instance is authenticated with
	  * @param callback callback function that is called for each public key you have a chat with
	  */


	  Chat.getChats = async function getChats(gun, keypair, callback) {
	    var mySecret = await Gun.SEA.secret(keypair.epub, keypair);
	    gun.user().get('chats').map().on(async function (value, ourSecretChatId) {
	      if (value) {
	        gun.user().get('chats').get(ourSecretChatId).get('pub').once(async function (encryptedPub) {
	          var pub = await Gun.SEA.decrypt(encryptedPub, mySecret);
	          callback(pub);
	        });
	      }
	    });
	  };

	  Chat.prototype.getOurSecretChatId = async function getOurSecretChatId(pub) {
	    if (!this.ourSecretChatIds[pub]) {
	      var secret = await this.getSecret(pub);
	      this.ourSecretChatIds[pub] = await Gun.SEA.work(secret + pub, null, null, { name: 'SHA-256' });
	    }
	    return this.ourSecretChatIds[pub];
	  };

	  Chat.prototype.getTheirSecretChatId = async function getTheirSecretChatId(pub) {
	    if (!this.theirSecretChatIds[pub]) {
	      var secret = await this.getSecret(pub);
	      this.theirSecretChatIds[pub] = await Gun.SEA.work(secret + this.key.pub, null, null, { name: 'SHA-256' });
	    }
	    return this.theirSecretChatIds[pub];
	  };

	  Chat.prototype.messageReceived = async function messageReceived(data, pub, selfAuthored) {
	    if (this.onMessage) {
	      var decrypted = await Gun.SEA.decrypt(data, (await this.getSecret(pub)));
	      if (typeof decrypted !== 'object') {
	        // console.log(`chat data received`, decrypted);
	        return;
	      }
	      this.onMessage(decrypted, { selfAuthored: selfAuthored });
	    }
	  };

	  /**
	  * Get latest message in this chat. Useful for chat listing.
	  */


	  Chat.prototype.getLatestMsg = async function getLatestMsg(callback) {
	    var _this = this;

	    var keys = _Object$keys(this.secrets);

	    var _loop = async function _loop(i) {
	      var ourSecretChatId = await _this.getOurSecretChatId(keys[i]);
	      _this.user.get('chats').get(ourSecretChatId).get('latestMsg').on(async function (data) {
	        var decrypted = await Gun.SEA.decrypt(data, (await _this.getSecret(keys[i])));
	        if (typeof decrypted !== 'object') {
	          // console.log(`chat data received`, decrypted);
	          return;
	        }
	        callback(decrypted, {});
	      });
	    };

	    for (var i = 0; i < keys.length; i++) {
	      await _loop(i);
	    }
	  };

	  /**
	  * Useful for notifications
	  * @param {integer} time last seen msg time (default: now)
	  */


	  Chat.prototype.setMyMsgsLastSeenTime = async function setMyMsgsLastSeenTime(time) {
	    var keys = _Object$keys(this.secrets);
	    time = time || new Date().toISOString();
	    for (var i = 0; i < keys.length; i++) {
	      var encrypted = await Gun.SEA.encrypt(time, (await this.getSecret(keys[i])));
	      var ourSecretChatId = await this.getOurSecretChatId(keys[i]);
	      this.user.get('chats').get(ourSecretChatId).get('msgsLastSeenTime').put(encrypted);
	    }
	  };

	  /**
	  * Useful for notifications
	  */


	  Chat.prototype.getMyMsgsLastSeenTime = async function getMyMsgsLastSeenTime(callback) {
	    var _this2 = this;

	    var keys = _Object$keys(this.secrets);

	    var _loop2 = async function _loop2(i) {
	      var ourSecretChatId = await _this2.getOurSecretChatId(keys[i]);
	      _this2.gun.user().get('chats').get(ourSecretChatId).get('msgsLastSeenTime').on(async function (data) {
	        _this2.myMsgsLastSeenTime = await Gun.SEA.decrypt(data, (await _this2.getSecret(keys[i])));
	        if (callback) {
	          callback(_this2.myMsgsLastSeenTime);
	        }
	      });
	    };

	    for (var i = 0; i < keys.length; i++) {
	      await _loop2(i);
	    }
	  };

	  /**
	  * For "seen" status indicator
	  */


	  Chat.prototype.getTheirMsgsLastSeenTime = async function getTheirMsgsLastSeenTime(callback) {
	    var _this3 = this;

	    var keys = _Object$keys(this.secrets);

	    var _loop3 = async function _loop3(i) {
	      var theirSecretChatId = await _this3.getTheirSecretChatId(keys[i]);
	      _this3.gun.user(keys[i]).get('chats').get(theirSecretChatId).get('msgsLastSeenTime').on(async function (data) {
	        _this3.theirMsgsLastSeenTime = await Gun.SEA.decrypt(data, (await _this3.getSecret(keys[i])));
	        if (callback) {
	          callback(_this3.theirMsgsLastSeenTime, keys[i]);
	        }
	      });
	    };

	    for (var i = 0; i < keys.length; i++) {
	      await _loop3(i);
	    }
	  };

	  /**
	  * Add a public key to the chat
	  * @param {string} pub
	  */


	  Chat.prototype.addPub = async function addPub(pub) {
	    var _this4 = this;

	    this.secrets[pub] = null;
	    this.getSecret(pub);
	    // Save their public key in encrypted format, so in chat listing we know who we are chatting with
	    var ourSecretChatId = await this.getOurSecretChatId(pub);
	    var mySecret = await Gun.SEA.secret(this.key.epub, this.key);
	    this.gun.user().get('chats').get(ourSecretChatId).get('pub').put((await Gun.SEA.encrypt(pub, mySecret)));
	    // Subscribe to their messages
	    var theirSecretChatId = await this.getTheirSecretChatId(pub);
	    this.gun.user(pub).get('chats').get(theirSecretChatId).get('msgs').map().once(function (data) {
	      _this4.messageReceived(data, pub);
	    });
	    // Subscribe to our messages
	    this.user.get('chats').get(ourSecretChatId).get('msgs').map().once(function (data) {
	      _this4.messageReceived(data, pub, true);
	    });
	  };

	  /**
	  * Send a message to the chat
	  * @param msg string or {time, author, text} object
	  */


	  Chat.prototype.send = async function send(msg) {
	    if (typeof msg === 'string') {
	      msg = {
	        time: new Date().toISOString(),
	        author: 'anonymous',
	        text: msg
	      };
	    }

	    //this.gun.user().get('message').set(temp);
	    var keys = _Object$keys(this.secrets);
	    for (var i = 0; i < keys.length; i++) {
	      var encrypted = await Gun.SEA.encrypt(_JSON$stringify(msg), (await this.getSecret(keys[i])));
	      var ourSecretChatId = await this.getOurSecretChatId(keys[i]);
	      this.user.get('chats').get(ourSecretChatId).get('msgs').get('' + msg.time).put(encrypted);
	      this.user.get('chats').get(ourSecretChatId).get('latestMsg').put(encrypted);
	    }
	  };

	  /**
	  * Set the user's online status
	  * @param {object} gun
	  * @param {boolean} isOnline true: update the user's lastActive time every 3 seconds, false: stop updating
	  */


	  Chat.setOnline = function setOnline(gun, isOnline) {
	    if (isOnline) {
	      var update = function update() {
	        gun.user().get('lastActive').put(Math.round(Gun.state() / 1000));
	      };
	      update();
	      gun.setOnlineInterval = setInterval(update, 3000);
	    } else {
	      clearInterval(gun.setOnlineInterval);
	    }
	  };

	  /**
	  * Get the online status of a user.
	  *
	  * @param {object} gun
	  * @param {string} pubKey public key of the user
	  * @param {boolean} callback receives a boolean each time the user's online status changes
	  */


	  Chat.getOnline = function getOnline(gun, pubKey, callback) {
	    var timeout = void 0;
	    gun.user(pubKey).get('lastActive').on(function (lastActive) {
	      clearTimeout(timeout);
	      var now = Math.round(Gun.state() / 1000);
	      var isOnline = lastActive > now - 10 && lastActive < now + 30;
	      callback({ isOnline: isOnline, lastActive: lastActive });
	      if (isOnline) {
	        timeout = setTimeout(function () {
	          return callback(false);
	        }, 10000);
	      }
	    });
	  };

	  /**
	  * In order to receive messages from others, this method must be called for newly created
	  * users that have not started a chat with an existing user yet.
	  *
	  * It saves the user's key.epub (public key for encryption) into their gun user space,
	  * so others can find it and write encrypted messages to them.
	  *
	  * If you start a chat with an existing user, key.epub is saved automatically and you don't need
	  * to call this method.
	  */


	  Chat.initUser = function initUser(gun, key) {
	    var user = gun.user();
	    user.auth(key);
	    user.put({ epub: key.epub });
	  };

	  return Chat;
	}();

	Gun.User.prototype.top = function (key) {
	  var gun = this,
	      root = gun.back(-1),
	      user = root.user();
	  if (!user.is) {
	    throw { err: 'Not logged in!' };
	  }
	  var top = user.chain(),
	      at = top._;
	  at.soul = at.get = '~' + user.is.pub + '.' + key;
	  var tmp = root.get(at.soul)._;
	  (tmp.echo || (tmp.echo = {}))[at.id] = at;
	  return top;
	};

	// temp method for GUN search
	async function searchText(node, callback, query, limit) {
	  // , cursor, desc
	  var seen = {};
	  node.map().once(function (value, key) {
	    //console.log(`searchText`, value, key, desc);
	    if (key.indexOf(query) === 0) {
	      if (typeof limit === 'number' && _Object$keys(seen).length >= limit) {
	        return;
	      }
	      if (Object.prototype.hasOwnProperty.call(seen, key)) {
	        return;
	      }
	      if (value && _Object$keys(value).length > 1) {
	        seen[key] = true;
	        callback({ value: value, key: key });
	      }
	    }
	  });
	}

	// TODO: flush onto IPFS
	/**
	* The essence of Iris: A database of Contacts and Messages within your web of trust.
	*
	* NOTE: these docs reflect the latest commit at https://github.com/irislib/iris-lib
	*
	* To use someone else's index (read-only): set options.pubKey
	*
	* To use your own index: set options.keypair or omit it to use Key.getDefaultKey().
	*
	* Each added Message updates the Message and Contacts indexes and web of trust accordingly.
	*
	* You can pass options.gun to use custom gun storages and networking settings.
	*
	* If you want messages saved to IPFS, pass options.ipfs = instance.
	*
	* Wait for index.ready promise to resolve before calling instance methods.
	* @param {Object} options see default options in example
	* @example
	* https://github.com/irislib/iris-lib/blob/master/__tests__/socialNetwork.js
	*
	* Default options:
	*{
	*  ipfs: undefined,
	*  keypair: undefined,
	*  pubKey: undefined,
	*  gun: undefined,
	*  self: undefined,
	*  indexSync: {
	*    importOnAdd: {
	*      enabled: true,
	*      maxMsgCount: 500,
	*      maxMsgDistance: 2
	*    },
	*    subscribe: {
	*      enabled: true,
	*      maxMsgDistance: 1
	*    },
	*    query: {
	*      enabled: true
	*    },
	*    msgTypes: {
	*      all: false,
	*      rating: true,
	*      verification: true,
	*      unverification: true
	*    },
	*    debug: false
	*  }
	*}
	* @returns {SocialNetwork}  index object
	*/

	var SocialNetwork = function () {
	  function SocialNetwork(options) {
	    var _this = this;

	    _classCallCheck(this, SocialNetwork);

	    this.options = _Object$assign({
	      ipfs: undefined,
	      keypair: undefined,
	      pubKey: undefined,
	      self: undefined,
	      indexSync: {
	        importOnAdd: {
	          enabled: true,
	          maxMsgCount: 100,
	          maxMsgDistance: 2
	        },
	        subscribe: {
	          enabled: true,
	          maxMsgDistance: 1
	        },
	        query: {
	          enabled: true
	        },
	        msgTypes: {
	          all: false,
	          rating: true,
	          verification: true,
	          unverification: true
	        },
	        debug: false
	      }
	    }, options);

	    if (options.pubKey) {
	      // someone else's index
	      var gun = options.gun || new Gun();
	      var user = gun.user(options.pubKey);
	      this.gun = user.get('iris');
	      this.rootContact = new Attribute({ type: 'keyID', value: options.pubKey });
	      this.ready = _Promise.resolve();
	    } else {
	      // our own index
	      this.ready = this._init();
	    }
	    this.ready.then(function () {
	      return _this._subscribeToTrustedIndexes();
	    });
	  }

	  SocialNetwork.prototype._init = async function _init() {
	    var _this2 = this;

	    var keypair = this.options.keypair;
	    if (!keypair) {
	      keypair = await Key.getDefault();
	    }
	    var gun = this.options.gun || new Gun();
	    var user = gun.user();
	    user.auth(keypair);
	    this.writable = true;
	    this.rootContact = new Attribute('keyID', Key.getId(keypair));
	    user.get('epub').put(keypair.epub);
	    // Initialize indexes with deterministic gun souls (.top)
	    this.gun = user.get('iris').put(user.top('iris'));
	    this.gun.get('identitiesBySearchKey').put(user.top('identitiesBySearchKey'));
	    this.gun.get('identitiesByTrustDistance').put(user.top('identitiesByTrustDistance'));
	    this.gun.get('messages').put(user.top('messages'));
	    this.gun.get('messagesByTimestamp').put(user.top('messagesByTimestamp'));
	    this.gun.get('messagesByHash').put(user.top('messagesByHash'));
	    this.gun.get('messagesByDistance').put(user.top('messagesByDistance'));

	    this.messages = new Collection({ gun: this.gun, class: Message, indexes: ['time', 'trustDistance'] });
	    this.contacts = new Collection({ gun: this.gun, class: Contact });

	    var uri = this.rootContact.uri();
	    var g = user.top(uri);
	    this.gun.get('identitiesBySearchKey').get(uri).put(g);
	    var attrs = {};
	    attrs[uri] = this.rootContact;
	    if (this.options.self) {
	      var keys = _Object$keys(this.options.self);
	      for (var i = 0; i < keys.length; i++) {
	        var a = new Attribute(keys[i], this.options.self[keys[i]]);
	        attrs[a.uri()] = a;
	      }
	    }
	    var id = Contact.create(g, { trustDistance: 0, linkTo: this.rootContact, attrs: attrs }, this);
	    await this._addContactToIndexes(id.gun);
	    if (this.options.self) {
	      var recipient = _Object$assign(this.options.self, { keyID: this.rootContact.value });
	      Message.createVerification({ recipient: recipient }, keypair).then(function (msg) {
	        _this2.addMessage(msg);
	      });
	    }
	  };

	  SocialNetwork.prototype._subscribeToTrustedIndexes = function _subscribeToTrustedIndexes() {
	    var _this3 = this;

	    if (this.writable && this.options.indexSync.subscribe.enabled) {
	      setTimeout(function () {
	        _this3.gun.get('trustedIndexes').map().once(function (val, uri) {
	          if (val) {
	            // TODO: only get new messages?
	            _this3.gun.user(uri).get('iris').get('messagesByDistance').map(function (val, key) {
	              var d = _Number$parseInt(key.split(':')[0]);
	              if (!isNaN(d) && d <= _this3.options.indexSync.subscribe.maxMsgDistance) {
	                Message.fromSig(val).then(function (msg) {
	                  if (_this3.options.indexSync.msgTypes.all || Object.prototype.hasOwnProperty.call(_this3.options.indexSync.msgTypes, msg.signedData.type)) {
	                    _this3.addMessage(msg, { checkIfExists: true });
	                  }
	                });
	              }
	            });
	            _this3.gun.user(uri).get('iris').get('reactions').map(function (reaction, msgHash) {
	              _this3.gun.get('messagesByHash').get(msgHash).get('reactions').get(uri).put(reaction);
	              _this3.gun.get('messagesByHash').get(msgHash).get('reactions').get(uri).put(reaction);
	            });
	          }
	        });
	      }, 5000); // TODO: this should be made to work without timeout
	    }
	  };

	  SocialNetwork.prototype.debug = function debug() {
	    var d = util$1.isNode && process$3.env.DEBUG ? process$3.env.DEBUG === 'true' : this.options.debug;
	    if (d) {
	      console.log.apply(console, arguments);
	    }
	  };

	  SocialNetwork.getMsgIndexKey = function getMsgIndexKey(msg) {
	    var distance = parseInt(msg.distance);
	    distance = _Number$isNaN(distance) ? 99 : distance;
	    distance = ('00' + distance).substring(distance.toString().length); // pad with zeros
	    var key = distance + ':' + Math.floor(Date.parse(msg.signedData.time || msg.signedData.timestamp)) + ':' + (msg.ipfs_hash || msg.hash).substr(0, 9);
	    return key;
	  };

	  // TODO: GUN indexing module that does this automatically


	  SocialNetwork.getMsgIndexKeys = function getMsgIndexKeys(msg) {
	    var keys = {};
	    var distance = parseInt(msg.distance);
	    distance = _Number$isNaN(distance) ? 99 : distance;
	    distance = ('00' + distance).substring(distance.toString().length); // pad with zeros
	    var timestamp = Math.floor(Date.parse(msg.signedData.time || msg.signedData.timestamp));
	    var hashSlice = msg.getHash().substr(0, 9);

	    if (msg.signedData.type === 'chat') {
	      if (msg.signedData.recipient.uuid) {
	        keys.chatMessagesByUuid = {};
	        keys.chatMessagesByUuid[msg.signedData.recipient.uuid] = msg.signedData.time + ':' + hashSlice;
	      }
	      return keys;
	    }

	    keys.messagesByHash = [msg.getHash()];
	    keys.messagesByTimestamp = [timestamp + ':' + hashSlice];
	    keys.messagesByDistance = [distance + ':' + keys.messagesByTimestamp[0]];
	    keys.messagesByType = [msg.signedData.type + ':' + timestamp + ':' + hashSlice];

	    keys.messagesByAuthor = {};
	    var authors = msg.getAuthorArray();
	    for (var i = 0; i < authors.length; i++) {
	      if (authors[i].isUniqueType()) {
	        keys.messagesByAuthor[authors[i].uri()] = msg.signedData.timestamp + ':' + hashSlice;
	      }
	    }
	    keys.messagesByRecipient = {};
	    var recipients = msg.getRecipientArray();
	    for (var _i = 0; _i < recipients.length; _i++) {
	      if (recipients[_i].isUniqueType()) {
	        keys.messagesByRecipient[recipients[_i].uri()] = msg.signedData.timestamp + ':' + hashSlice;
	      }
	    }

	    if (['verification', 'unverification'].indexOf(msg.signedData.type) > -1) {
	      keys.verificationsByRecipient = {};
	      for (var _i2 = 0; _i2 < recipients.length; _i2++) {
	        var r = recipients[_i2];
	        if (!r.isUniqueType()) {
	          continue;
	        }
	        for (var j = 0; j < authors.length; j++) {
	          var a = authors[j];
	          if (!a.isUniqueType()) {
	            continue;
	          }
	          keys.verificationsByRecipient[r.uri()] = a.uri();
	        }
	      }
	    } else if (msg.signedData.type === 'rating') {
	      keys.ratingsByRecipient = {};
	      for (var _i3 = 0; _i3 < recipients.length; _i3++) {
	        var _r = recipients[_i3];
	        if (!_r.isUniqueType()) {
	          continue;
	        }
	        for (var _j = 0; _j < authors.length; _j++) {
	          var _a = authors[_j];
	          if (!_a.isUniqueType()) {
	            continue;
	          }
	          keys.ratingsByRecipient[_r.uri()] = _a.uri();
	        }
	      }
	    }
	    return keys;
	  };

	  SocialNetwork.prototype.getContactIndexKeys = async function getContactIndexKeys(contact, hash) {
	    var indexKeys = { identitiesByTrustDistance: [], identitiesBySearchKey: [] };
	    var d = void 0;
	    if (contact.keyID && this.rootContact.equals(contact.linkTo)) {
	      // TODO: contact is a gun instance, no linkTo
	      d = 0;
	    } else {
	      d = await contact.get('trustDistance').then();
	    }

	    function addIndexKey(a) {
	      if (!(a && a.value && a.type)) {
	        // TODO: this sometimes returns undefined
	        return;
	      }
	      var distance = d !== undefined ? d : parseInt(a.dist);
	      distance = _Number$isNaN(distance) ? 99 : distance;
	      distance = ('00' + distance).substring(distance.toString().length); // pad with zeros
	      var v = a.value || a[1];
	      var n = a.type || a[0];
	      var value = encodeURIComponent(v);
	      var lowerCaseValue = encodeURIComponent(v.toLowerCase());
	      var name = encodeURIComponent(n);
	      var key = value + ':' + name;
	      var lowerCaseKey = lowerCaseValue + ':' + name;
	      if (!Attribute.isUniqueType(n)) {
	        // allow for multiple index keys with same non-unique attribute
	        key = key + ':' + hash.substr(0, 9);
	        lowerCaseKey = lowerCaseKey + ':' + hash.substr(0, 9);
	      }
	      indexKeys.identitiesBySearchKey.push(key);
	      indexKeys.identitiesByTrustDistance.push(distance + ':' + key);
	      if (key !== lowerCaseKey) {
	        indexKeys.identitiesBySearchKey.push(lowerCaseKey);
	        indexKeys.identitiesByTrustDistance.push(distance + ':' + lowerCaseKey);
	      }
	      if (v.indexOf(' ') > -1) {
	        var words = v.toLowerCase().split(' ');
	        for (var l = 0; l < words.length; l += 1) {
	          var k = encodeURIComponent(words[l]) + ':' + name;
	          if (!Attribute.isUniqueType(n)) {
	            k = k + ':' + hash.substr(0, 9);
	          }
	          indexKeys.identitiesBySearchKey.push(k);
	          indexKeys.identitiesByTrustDistance.push(distance + ':' + k);
	        }
	      }
	      if (key.match(/^http(s)?:\/\/.+\/[a-zA-Z0-9_]+$/)) {
	        var split = key.split('/');
	        indexKeys.identitiesBySearchKey.push(split[split.length - 1]);
	        indexKeys.identitiesByTrustDistance.push(distance + ':' + split[split.length - 1]);
	      }
	    }

	    if (this.rootContact.equals(contact.keyID)) {
	      addIndexKey(contact.keyID);
	    }

	    var attrs = await Contact.getAttrs(contact);
	    _Object$values(attrs).map(addIndexKey);

	    return indexKeys;
	  };

	  /**
	  *
	  */


	  SocialNetwork.prototype.addContact = async function addContact(attributes) {
	    var follow = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : true;

	    // TODO: add uuid to attributes
	    var msg = void 0;
	    if (follow) {
	      msg = await Message.createRating({ recipient: attributes, rating: 1 });
	    } else {
	      msg = await Message.createVerification({ recipient: attributes });
	    }
	    return this.addMessage(msg);
	  };

	  /*
	  * Get an contact referenced by an identifier.
	  * get(type, value)
	  * get(Attribute)
	  * get(value) - guesses the type or throws an error
	  * @returns {Contact} contact that is connected to the identifier param
	  */


	  SocialNetwork.prototype.getContact = function getContact(a, b) {
	    var _this4 = this;

	    var reload = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

	    if (!a) {
	      throw new Error('getContact failed: first param must be defined');
	    }
	    var attr = a;
	    if (a.constructor.name !== 'Attribute') {
	      var type = void 0,
	          value = void 0;
	      if (b) {
	        type = a;
	        value = b;
	      } else {
	        value = a;
	        type = Attribute.guessTypeOf(value);
	      }
	      attr = new Attribute(type, value);
	    }
	    if (reload) {
	      // 1) get verifications connecting attr to other attributes
	      // 2) recurse
	      // 3) get messages received by this list of attributes
	      // 4) calculate stats
	      // 5) update contact index entry
	      var o = {
	        attributes: {},
	        sent: {},
	        received: {},
	        receivedPositive: 0,
	        receivedNeutral: 0,
	        receivedNegative: 0,
	        sentPositive: 0,
	        sentNeutral: 0,
	        sentNegative: 0
	      };
	      var node = this.gun.get('identities').set(o);
	      var updateContactByLinkedAttribute = function updateContactByLinkedAttribute(attribute) {
	        _this4.gun.get('verificationsByRecipient').get(attribute.uri()).map().once(function (val) {
	          var m = Message.fromSig(val);
	          var recipients = m.getRecipientArray();
	          for (var i = 0; i < recipients.length; i++) {
	            var a2 = recipients[i];
	            if (!Object.prototype.hasOwnProperty.call(o.attributes), a2.uri()) {
	              // TODO remove attribute from contact if not enough verifications / too many unverifications
	              o.attributes[a2.uri()] = a2;
	              _this4.gun.get('messagesByRecipient').get(a2.uri()).map().once(function (val) {
	                var m2 = Message.fromSig(val);
	                if (!Object.prototype.hasOwnProperty.call(o.received.hasOwnProperty, m2.getHash())) {
	                  o.received[m2.getHash()] = m2;
	                  if (m2.isPositive()) {
	                    o.receivedPositive++;
	                    m2.getAuthor(_this4).gun.get('trustDistance').on(function (d) {
	                      if (typeof d === 'number') {
	                        if (typeof o.trustDistance !== 'number' || o.trustDistance > d + 1) {
	                          o.trustDistance = d + 1;
	                          node.get('trustDistance').put(d + 1);
	                        }
	                      }
	                    });
	                  } else if (m2.isNegative()) {
	                    o.receivedNegative++;
	                  } else {
	                    o.receivedNeutral++;
	                  }
	                  node.put(o);
	                }
	              });
	              _this4.gun.get('messagesByAuthor').get(a2.uri()).map().once(function (val) {
	                var m2 = Message.fromSig(val);
	                if (!Object.prototype.hasOwnProperty.call(o.sent, m2.getHash())) {
	                  o.sent[m2.getHash()] = m2;
	                  if (m2.isPositive()) {
	                    o.sentPositive++;
	                  } else if (m2.isNegative()) {
	                    o.sentNegative++;
	                  } else {
	                    o.sentNeutral++;
	                  }
	                  node.put(o);
	                }
	              });
	              updateContactByLinkedAttribute(a2);
	            }
	          }
	        });
	      };
	      updateContactByLinkedAttribute(attr);
	      if (this.writable) {
	        this._addContactToIndexes(node);
	      }
	      return new Contact(node, attr, this);
	    } else {
	      return new Contact(this.gun.get('identitiesBySearchKey').get(attr.uri()), attr, this);
	    }
	  };

	  /**
	  *
	  */


	  SocialNetwork.prototype.getContacts = function getContacts() {
	    var _this5 = this;

	    var opt = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
	    // cursor // TODO: param 'exact', type param
	    if (opt.value) {
	      if (opt.type) {
	        return this.getContact(opt.type, opt.value, opt.reload);
	      } else {
	        return this.getContact(opt.value);
	      }
	    }
	    opt.query = opt.query || '';
	    var seen = {};
	    function searchTermCheck(key) {
	      var arr = key.split(':');
	      if (arr.length < 2) {
	        return false;
	      }
	      var keyValue = arr[0];
	      var keyType = arr[1];
	      if (keyValue.indexOf(encodeURIComponent(opt.query)) !== 0) {
	        return false;
	      }
	      if (opt.type && keyType !== opt.type) {
	        return false;
	      }
	      return true;
	    }
	    var node = this.gun.get('identitiesBySearchKey');
	    node.map().on(function (id, key) {
	      if (_Object$keys(seen).length >= opt.limit) {
	        // TODO: turn off .map cb
	        return;
	      }
	      if (!searchTermCheck(key)) {
	        return;
	      }
	      var soul = Gun.node.soul(id);
	      if (soul && !Object.prototype.hasOwnProperty.call(seen, soul)) {
	        seen[soul] = true;
	        var contact = new Contact(node.get(key), undefined, _this5);
	        contact.cursor = key;
	        opt.callback(contact);
	      }
	    });
	    if (this.options.indexSync.query.enabled) {
	      this.gun.get('trustedIndexes').map().once(function (val, key) {
	        if (val) {
	          _this5.gun.user(key).get('iris').get('identitiesBySearchKey').map().on(function (id, k) {
	            if (_Object$keys(seen).length >= opt.limit) {
	              // TODO: turn off .map cb
	              return;
	            }
	            if (!searchTermCheck(key)) {
	              return;
	            }
	            var soul = Gun.node.soul(id);
	            if (soul && !Object.prototype.hasOwnProperty.call(seen, soul)) {
	              seen[soul] = true;
	              opt.callback(new Contact(_this5.gun.user(key).get('iris').get('identitiesBySearchKey').get(k), undefined, _this5));
	            }
	          });
	        }
	      });
	    }
	  };

	  /**
	  * @returns {Contact} root contact (center of the social graph, trustDistance == 0)
	  */


	  SocialNetwork.prototype.getRootContact = function getRootContact() {
	    return new Contact(this.gun.get('identitiesBySearchKey').get(this.rootContact.uri()), undefined, this);
	  };

	  /**
	  * Return existing chats and listen to new chats initiated by friends.
	  * Like Chat.getChats(), but also listens to chats initiated by friends.
	  */


	  SocialNetwork.prototype.getChats = async function getChats(callback) {
	    var _this6 = this;

	    Chat.getChats(this.gun, this.options.keypair, callback);
	    this.gun.get('trustedIndexes').map().on(async function (value, pub) {
	      if (value && pub) {
	        var theirSecretChatId = await Chat.getTheirSecretChatId(_this6.gun, pub, _this6.options.keypair);
	        _this6.gun.user(pub).get('chats').get(theirSecretChatId).on(function (v) {
	          if (v) {
	            callback(pub);
	          }
	        });
	      }
	    });
	  };

	  SocialNetwork.prototype._getMsgs = async function _getMsgs(msgIndex, callback, limit, cursor, desc, filter) {
	    var results = 0;
	    async function resultFound(result) {
	      if (results >= limit) {
	        return;
	      }
	      var msg = await Message.fromSig(result.value);
	      if (filter && !filter(msg)) {
	        return;
	      }
	      results++;
	      msg.cursor = result.key;
	      if (result.value && result.value.ipfsUri) {
	        msg.ipfsUri = result.value.ipfsUri;
	      }
	      msg.gun = msgIndex.get(result.key);
	      callback(msg);
	    }
	    searchText(msgIndex, resultFound, '', undefined, cursor, desc);
	  };

	  SocialNetwork.prototype._addContactToIndexes = async function _addContactToIndexes(id) {
	    if (typeof id === 'undefined') {
	      var e = new Error('id is undefined');
	      console.error(e.stack);
	      throw e;
	    }
	    var hash = Gun.node.soul(id) || id._ && id._.link || 'todo';
	    var indexKeys = await this.getContactIndexKeys(id, hash.substr(0, 6));

	    var indexes = _Object$keys(indexKeys);
	    for (var i = 0; i < indexes.length; i++) {
	      var index = indexes[i];
	      for (var j = 0; j < indexKeys[index].length; j++) {
	        var key = indexKeys[index][j];
	        // this.debug(`adding to index ${index} key ${key}, saving data: ${id}`);
	        this.gun.get(index).get(key).put(id); // FIXME: Check, why this can't be `await`ed for in tests? [index.ready promise gets stuck]
	      }
	    }
	  };

	  SocialNetwork.prototype._getSentMsgs = async function _getSentMsgs(contact, options) {
	    var _this7 = this;

	    this._getMsgs(contact.gun.get('sent'), options.callback, options.limit, options.cursor, true, options.filter);
	    if (this.options.indexSync.query.enabled) {
	      this.gun.get('trustedIndexes').map().once(function (val, key) {
	        if (val) {
	          var n = _this7.gun.user(key).get('iris').get('messagesByAuthor').get(contact.linkTo.uri());
	          _this7._getMsgs(n, options.callback, options.limit, options.cursor, false, options.filter);
	        }
	      });
	    }
	  };

	  SocialNetwork.prototype._getReceivedMsgs = async function _getReceivedMsgs(contact, options) {
	    var _this8 = this;

	    this._getMsgs(contact.gun.get('received'), options.callback, options.limit, options.cursor, true, options.filter);
	    if (this.options.indexSync.query.enabled) {
	      this.gun.get('trustedIndexes').map().once(function (val, key) {
	        if (val) {
	          var n = _this8.gun.user(key).get('iris').get('messagesByRecipient').get(contact.linkTo.uri());
	          _this8._getMsgs(n, options.callback, options.limit, options.cursor, false, options.filter);
	        }
	      });
	    }
	  };

	  SocialNetwork.prototype.getChatMsgs = async function getChatMsgs(uuid, options) {
	    var _this9 = this;

	    this._getMsgs(this.gun.get('chatMessagesByUuid').get(uuid), options.callback, options.limit, options.cursor, true, options.filter);
	    var callback = function callback(msg) {
	      if (options.callback) {
	        options.callback(msg);
	      }
	      _this9.addMessage(msg, { checkIfExists: true });
	    };
	    this.gun.get('trustedIndexes').map().once(function (val, key) {
	      if (val) {
	        var n = _this9.gun.user(key).get('iris').get('chatMessagesByUuid').get(uuid);
	        _this9._getMsgs(n, callback, options.limit, options.cursor, false, options.filter);
	      }
	    });
	  };

	  SocialNetwork.prototype._getAttributeTrustDistance = async function _getAttributeTrustDistance(a) {
	    if (!Attribute.isUniqueType(a.type)) {
	      return;
	    }
	    if (this.rootContact.equals(a)) {
	      return 0;
	    }
	    var id = this.getContact(a);
	    var d = await id.gun.get('trustDistance').then();
	    if (isNaN(d)) {
	      d = Infinity;
	    }
	    return d;
	  };

	  SocialNetwork.prototype._getMsgTrustDistance = async function _getMsgTrustDistance(msg) {
	    var shortestDistance = Infinity;
	    var signerAttr = new Attribute('keyID', msg.getSignerKeyID());
	    if (!signerAttr.equals(this.rootContact)) {
	      var signer = this.getContact(signerAttr);
	      var d = await signer.gun.get('trustDistance').then();
	      if (isNaN(d)) {
	        return;
	      }
	    }
	    for (var _iterator = msg.getAuthorArray(), _isArray = Array.isArray(_iterator), _i4 = 0, _iterator = _isArray ? _iterator : _getIterator(_iterator);;) {
	      var _ref;

	      if (_isArray) {
	        if (_i4 >= _iterator.length) break;
	        _ref = _iterator[_i4++];
	      } else {
	        _i4 = _iterator.next();
	        if (_i4.done) break;
	        _ref = _i4.value;
	      }

	      var a = _ref;

	      var _d = await this._getAttributeTrustDistance(a);
	      if (_d < shortestDistance) {
	        shortestDistance = _d;
	      }
	    }
	    return shortestDistance < Infinity ? shortestDistance : undefined;
	  };

	  SocialNetwork.prototype._updateMsgRecipientContact = async function _updateMsgRecipientContact(msg, msgIndexKey, recipient) {
	    var hash = recipient._ && recipient._.link || 'todo';
	    var contactIndexKeysBefore = await this.getContactIndexKeys(recipient, hash.substr(0, 6));
	    var attrs = await Contact.getAttrs(recipient);
	    if (['verification', 'unverification'].indexOf(msg.signedData.type) > -1) {
	      var isVerification = msg.signedData.type === 'verification';

	      var _loop = function _loop() {
	        if (_isArray2) {
	          if (_i5 >= _iterator2.length) return 'break';
	          _ref2 = _iterator2[_i5++];
	        } else {
	          _i5 = _iterator2.next();
	          if (_i5.done) return 'break';
	          _ref2 = _i5.value;
	        }

	        var a = _ref2;

	        var hasAttr = false;
	        var v = {
	          verifications: isVerification ? 1 : 0,
	          unverifications: isVerification ? 0 : 1
	        };
	        _Object$keys(attrs).forEach(function (k) {
	          // TODO: if author is self, mark as self verified
	          // TODO: only 1 verif / unverif per author
	          if (a.equals(attrs[k])) {
	            attrs[k].verifications = (attrs[k].verifications || 0) + v.verifications;
	            attrs[k].unverifications = (attrs[k].unverifications || 0) + v.unverifications;
	            hasAttr = true;
	          }
	        });
	        if (!hasAttr) {
	          attrs[a.uri()] = _Object$assign({ type: a.type, value: a.value }, v);
	        }
	        if (msg.goodVerification) {
	          if (isVerification) {
	            attrs[a.uri()].wellVerified = true;
	          } else {
	            attrs[a.uri()].wellUnverified = true;
	          }
	        }
	      };

	      for (var _iterator2 = msg.getRecipientArray(), _isArray2 = Array.isArray(_iterator2), _i5 = 0, _iterator2 = _isArray2 ? _iterator2 : _getIterator(_iterator2);;) {
	        var _ref2;

	        var _ret = _loop();

	        if (_ret === 'break') break;
	      }
	      var mva = Contact.getMostVerifiedAttributes(attrs);
	      recipient.get('mostVerifiedAttributes').put(mva); // TODO: why this needs to be done twice to register?
	      recipient.get('mostVerifiedAttributes').put(mva);
	      var k = mva.keyID && mva.keyID.attribute.value || mva.uuid && mva.uuid.attribute.value || hash;
	      console.log('k', k);
	      recipient.get('attrs').put(this.gun.user().top(k + '/attrs'));
	      recipient.get('attrs').put(attrs);
	      recipient.get('attrs').put(attrs);
	    }
	    if (msg.signedData.type === 'rating') {
	      var id = await recipient.then();
	      id.receivedPositive = id.receivedPositive || 0;
	      id.receivedNegative = id.receivedNegative || 0;
	      id.receivedNeutral = id.receivedNeutral || 0;
	      if (msg.isPositive()) {
	        if (typeof id.trustDistance !== 'number' || msg.distance + 1 < id.trustDistance) {
	          recipient.get('trustDistance').put(msg.distance + 1);
	        }
	        id.receivedPositive++;
	      } else {
	        if (msg.distance < id.trustDistance) {
	          recipient.get('trustDistance').put(false); // TODO: this should take into account the aggregate score of the contact
	        }
	        if (msg.isNegative()) {
	          id.receivedNegative++;
	        } else {
	          id.receivedNeutral++;
	        }
	      }

	      recipient.put({
	        receivedPositive: id.receivedPositive,
	        receivedNegative: id.receivedNegative,
	        receivedNeutral: id.receivedNeutral
	      });

	      if (msg.signedData.context === 'verifier') {
	        if (msg.distance === 0) {
	          if (msg.isPositive) {
	            recipient.get('scores').get(msg.signedData.context).get('score').put(10);
	          } else if (msg.isNegative()) {
	            recipient.get('scores').get(msg.signedData.context).get('score').put(0);
	          } else {
	            recipient.get('scores').get(msg.signedData.context).get('score').put(-10);
	          }
	        }
	      }
	    }
	    var obj = { sig: msg.sig, pubKey: msg.pubKey };
	    if (msg.ipfsUri) {
	      obj.ipfsUri = msg.ipfsUri;
	    }

	    recipient.get('received').get(msgIndexKey).put(obj);
	    recipient.get('received').get(msgIndexKey).put(obj);

	    var contactIndexKeysAfter = await this.getContactIndexKeys(recipient, hash.substr(0, 6));
	    var indexesBefore = _Object$keys(contactIndexKeysBefore);
	    for (var i = 0; i < indexesBefore.length; i++) {
	      var index = indexesBefore[i];
	      for (var j = 0; j < contactIndexKeysBefore[index].length; j++) {
	        var key = contactIndexKeysBefore[index][j];
	        if (!contactIndexKeysAfter[index] || contactIndexKeysAfter[index].indexOf(key) === -1) {
	          this.gun.get(index).get(key).put(null);
	        }
	      }
	    }
	  };

	  SocialNetwork.prototype._updateMsgAuthorContact = async function _updateMsgAuthorContact(msg, msgIndexKey, author) {
	    if (msg.signedData.type === 'rating') {
	      var id = await author.then();
	      id.sentPositive = id.sentPositive || 0;
	      id.sentNegative = id.sentNegative || 0;
	      id.sentNeutral = id.sentNeutral || 0;
	      if (msg.isPositive()) {
	        id.sentPositive++;
	      } else if (msg.isNegative()) {
	        id.sentNegative++;
	      } else {
	        id.sentNeutral++;
	      }
	      author.get('sentPositive').put(id.sentPositive);
	      author.get('sentNegative').put(id.sentNegative);
	      author.get('sentNeutral').put(id.sentNeutral);
	    }
	    var obj = { sig: msg.sig, pubKey: msg.pubKey };
	    if (msg.ipfsUri) {
	      obj.ipfsUri = msg.ipfsUri;
	    }
	    author.get('sent').get(msgIndexKey).put(obj); // for some reason, doesn't work unless I do it twice
	    author.get('sent').get(msgIndexKey).put(obj);
	    return;
	  };

	  SocialNetwork.prototype._updateContactProfilesByMsg = async function _updateContactProfilesByMsg(msg, authorIdentities, recipientIdentities) {
	    var start = void 0;
	    var msgIndexKey = SocialNetwork.getMsgIndexKey(msg);
	    msgIndexKey = msgIndexKey.substr(msgIndexKey.indexOf(':') + 1);
	    var ids = _Object$values(_Object$assign({}, authorIdentities, recipientIdentities));
	    for (var i = 0; i < ids.length; i++) {
	      // add new identifiers to contact
	      if (Object.prototype.hasOwnProperty.call(recipientIdentities, ids[i].gun['_'].link)) {
	        start = new Date();
	        await this._updateMsgRecipientContact(msg, msgIndexKey, ids[i].gun);
	        this.debug(new Date() - start, 'ms _updateMsgRecipientContact');
	      }
	      if (Object.prototype.hasOwnProperty.call(authorIdentities, ids[i].gun['_'].link)) {
	        start = new Date();
	        await this._updateMsgAuthorContact(msg, msgIndexKey, ids[i].gun);
	        this.debug(new Date() - start, 'ms _updateMsgAuthorContact');
	      }
	      start = new Date();
	      await this._addContactToIndexes(ids[i].gun);
	      this.debug(new Date() - start, 'ms _addContactToIndexes');
	    }
	  };

	  SocialNetwork.prototype.removeTrustedIndex = async function removeTrustedIndex(gunUri) {
	    this.gun.get('trustedIndexes').get(gunUri).put(null);
	  };

	  SocialNetwork.prototype.addTrustedIndex = async function addTrustedIndex(gunUri) {
	    var _this10 = this;

	    var maxMsgsToCrawl = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : this.options.indexSync.importOnAdd.maxMsgCount;
	    // maxMsgDistance = this.options.indexSync.importOnAdd.maxMsgDistance
	    if (gunUri === this.rootContact.value) {
	      return;
	    }
	    var exists = await this.gun.get('trustedIndexes').get(gunUri).then();
	    if (exists) {
	      return;
	    }
	    this.gun.get('trustedIndexes').get(gunUri).put(true);
	    var msgs = [];
	    if (this.options.indexSync.importOnAdd.enabled) {
	      await util$1.timeoutPromise(new _Promise(function (resolve) {
	        var gun = _this10.gun.user(gunUri).get('iris');
	        var callback = function callback(msg) {
	          msgs.push(msg);
	          if (msgs.length >= maxMsgsToCrawl) {
	            resolve();
	          }
	        };
	        var messages = new Collection({ gun: gun, class: Message, indexes: ['trustDistance'] });
	        messages.get({ callback: callback, orderBy: 'trustDistance', desc: false });
	      }), 10000);
	      this.debug('adding', msgs.length, 'msgs');
	      this.addMessages(msgs);
	    }
	  };

	  SocialNetwork.prototype._updateContactIndexesByMsg = async function _updateContactIndexesByMsg(msg) {
	    var recipientIdentities = {};
	    var authorIdentities = {};
	    var selfAuthored = false;
	    var start = void 0;
	    start = new Date();
	    for (var _iterator3 = msg.getAuthorArray(), _isArray3 = Array.isArray(_iterator3), _i6 = 0, _iterator3 = _isArray3 ? _iterator3 : _getIterator(_iterator3);;) {
	      var _ref3;

	      if (_isArray3) {
	        if (_i6 >= _iterator3.length) break;
	        _ref3 = _iterator3[_i6++];
	      } else {
	        _i6 = _iterator3.next();
	        if (_i6.done) break;
	        _ref3 = _i6.value;
	      }

	      var _a3 = _ref3;

	      var _id = this.getContact(_a3);
	      var start2 = new Date();
	      var td = await _id.gun.get('trustDistance').then();
	      this.debug(new Date() - start2, 'ms get trustDistance');
	      if (!isNaN(td)) {
	        authorIdentities[_id.gun['_'].link] = _id;
	        start2 = new Date();
	        var scores = await _id.gun.get('scores').then();
	        this.debug(new Date() - start2, 'ms get scores');
	        if (scores && scores.verifier && msg.signedData.type === 'verification') {
	          msg.goodVerification = true;
	        }
	        if (td === 0) {
	          selfAuthored = true;
	        }
	      }
	    }
	    this.debug(new Date() - start, 'ms getAuthorArray');
	    if (!_Object$keys(authorIdentities).length) {
	      return; // unknown author, do nothing
	    }
	    start = new Date();
	    for (var _iterator4 = msg.getRecipientArray(), _isArray4 = Array.isArray(_iterator4), _i7 = 0, _iterator4 = _isArray4 ? _iterator4 : _getIterator(_iterator4);;) {
	      var _ref4;

	      if (_isArray4) {
	        if (_i7 >= _iterator4.length) break;
	        _ref4 = _iterator4[_i7++];
	      } else {
	        _i7 = _iterator4.next();
	        if (_i7.done) break;
	        _ref4 = _i7.value;
	      }

	      var _a4 = _ref4;

	      var _id2 = this.getContact(_a4);
	      var _td = await _id2.gun.get('trustDistance').then();

	      if (!isNaN(_td)) {
	        recipientIdentities[_id2.gun['_'].link] = _id2;
	      }
	      if (selfAuthored && _a4.type === 'keyID' && _a4.value !== this.rootContact.value) {
	        // TODO: not if already added - causes infinite loop?
	        if (msg.isPositive()) {
	          this.addTrustedIndex(_a4.value);
	        } else {
	          this.removeTrustedIndex(_a4.value);
	        }
	      }
	    }
	    this.debug(new Date() - start, 'ms getRecipientArray');
	    if (!msg.signedData.recipient) {
	      // message to self
	      recipientIdentities = authorIdentities;
	    }
	    if (!_Object$keys(recipientIdentities).length) {
	      // recipient is previously unknown
	      var attrs = {};
	      var u = void 0;
	      for (var _iterator5 = msg.getRecipientArray(), _isArray5 = Array.isArray(_iterator5), _i8 = 0, _iterator5 = _isArray5 ? _iterator5 : _getIterator(_iterator5);;) {
	        var _ref5;

	        if (_isArray5) {
	          if (_i8 >= _iterator5.length) break;
	          _ref5 = _iterator5[_i8++];
	        } else {
	          _i8 = _iterator5.next();
	          if (_i8.done) break;
	          _ref5 = _i8.value;
	        }

	        var _a2 = _ref5;

	        attrs[_a2.uri()] = _a2;
	        if (!u && _a2.isUniqueType()) {
	          u = _a2;
	        }
	      }
	      var linkTo = Contact.getLinkTo(attrs);
	      var trustDistance = msg.isPositive() && typeof msg.distance === 'number' ? msg.distance + 1 : false;
	      var _start = new Date();
	      var node = this.gun.get('identitiesBySearchKey').get(u.uri());
	      node.put({ a: 1 }); // {a:1} because inserting {} causes a "no signature on data" error from gun
	      var id = Contact.create(node, { attrs: attrs, linkTo: linkTo, trustDistance: trustDistance }, this);
	      this.debug(new Date() - _start, 'ms contact.create');

	      // TODO: take msg author trust into account
	      recipientIdentities[id.gun['_'].link] = id;
	    }

	    return this._updateContactProfilesByMsg(msg, authorIdentities, recipientIdentities);
	  };

	  /**
	  * Add a message to messagesByTimestamp and other relevant indexes. Update identities in the web of trust according to message data.
	  *
	  * @param msg Message (or an array of messages) to add to the index
	  */


	  SocialNetwork.prototype.addMessage = async function addMessage(msg) {
	    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	    if (!this.writable) {
	      throw new Error('Cannot write to a read-only index (initialized with options.pubKey)');
	    }
	    if (Array.isArray(msg)) {
	      return this.addMessages(msg, options);
	    }
	    var start = void 0;
	    if (msg.constructor.name !== 'Message') {
	      throw new Error('addMessage failed: param must be a Message, received ' + msg.constructor.name);
	    }
	    var hash = msg.getHash();
	    if (true === options.checkIfExists) {
	      var exists = await this.gun.get('messagesByHash').get(hash).then();
	      if (exists) {
	        return;
	      }
	    }
	    var obj = { sig: msg.sig, pubKey: msg.pubKey };
	    //const node = this.gun.get(`messagesByHash`).get(hash).put(obj);
	    var node = this.gun.back(-1).get('messagesByHash').get(hash).put(obj); // TODO: needs fix to https://github.com/amark/gun/issues/719
	    start = new Date();
	    var d = await this._getMsgTrustDistance(msg);
	    msg.distance = Object.prototype.hasOwnProperty.call(msg, 'distance') ? msg.distance : d; // eslint-disable-line require-atomic-updates
	    this.debug('----');
	    this.debug(new Date() - start, 'ms _getMsgTrustDistance');
	    if (msg.distance === undefined) {
	      return false; // do not save messages from untrusted author
	    }
	    if (msg.signedData.replyTo) {
	      this.gun.back(-1).get('messagesByHash').get(msg.signedData.replyTo).get('replies').get(hash).put(node);
	      this.gun.back(-1).get('messagesByHash').get(msg.signedData.replyTo).get('replies').get(hash).put(node);
	    }
	    if (msg.signedData.sharedMsg) {
	      this.gun.back(-1).get('messagesByHash').get(msg.signedData.sharedMsg).get('shares').get(hash).put(node);
	      this.gun.back(-1).get('messagesByHash').get(msg.signedData.sharedMsg).get('shares').get(hash).put(node);
	    }
	    start = new Date();

	    this.messages.put(msg);

	    // TODO: this should be moved to Collection
	    var indexKeys = SocialNetwork.getMsgIndexKeys(msg);
	    this.debug(new Date() - start, 'ms getMsgIndexKeys');
	    for (var index in indexKeys) {
	      if (Array.isArray(indexKeys[index])) {
	        for (var i = 0; i < indexKeys[index].length; i++) {
	          var key = indexKeys[index][i];
	          // this.debug(`adding to index ${index} key ${key}`);
	          this.gun.get(index).get(key).put(node);
	          this.gun.get(index).get(key).put(node); // umm, what? doesn't work unless I write it twice
	        }
	      } else if (typeof indexKeys[index] === 'object') {
	        for (var _key in indexKeys[index]) {
	          this.gun.get(index).get(_key).get(indexKeys[index][_key]).put(node);
	          this.gun.get(index).get(_key).get(indexKeys[index][_key]).put(node);
	        }
	      }
	    }

	    if (this.options.ipfs) {
	      try {
	        var ipfsUri = await msg.saveToIpfs(this.options.ipfs);
	        this.gun.get('messagesByHash').get(ipfsUri).put(node);
	        this.gun.get('messagesByHash').get(ipfsUri).put(node);
	        this.gun.get('messagesByHash').get(ipfsUri).put({ ipfsUri: ipfsUri });
	      } catch (e) {
	        console.error('adding msg ' + msg + ' to ipfs failed: ' + e);
	      }
	    }
	    if (msg.signedData.type !== 'chat') {
	      start = new Date();
	      await this._updateContactIndexesByMsg(msg);
	      this.debug(new Date() - start, 'ms _updateContactIndexesByMsg');
	    }
	    return true;
	  };

	  /**
	  * Alias to socialNetwork.messages.get(opt) (but with opt.orderBy = 'time')
	  * @param {Object} opt {hash, orderBy, callback, limit, cursor, desc, filter}
	  */


	  SocialNetwork.prototype.getMessages = async function getMessages(opt) {
	    if (opt.hash) {
	      return this.messages.get({ id: opt.hash });
	    }
	    opt.orderBy = opt.orderBy || 'time';
	    return this.messages.get(opt);
	  };

	  /*
	  * Add a list of messages to the index.
	  * Useful for example when adding a new WoT dataset that contains previously
	  * unknown authors.
	  *
	  * Iteratively performs sorted merge joins on [previously known contacts] and
	  * [new msgs authors], until all messages from within the WoT have been added.
	  *
	  * @param {Array} msgs an array of messages.
	  * @returns {boolean} true on success
	  */


	  SocialNetwork.prototype.addMessages = async function addMessages(msgs) {
	    var _this11 = this;

	    if (!this.writable) {
	      throw new Error('Cannot write to a read-only index (initialized with options.pubKey)');
	    }
	    var msgsByAuthor = {};
	    if (Array.isArray(msgs)) {
	      this.debug('sorting ' + msgs.length + ' messages onto a search tree...');
	      for (var i = 0; i < msgs.length; i++) {
	        for (var _iterator6 = msgs[i].getAuthorArray(), _isArray6 = Array.isArray(_iterator6), _i9 = 0, _iterator6 = _isArray6 ? _iterator6 : _getIterator(_iterator6);;) {
	          var _ref6;

	          if (_isArray6) {
	            if (_i9 >= _iterator6.length) break;
	            _ref6 = _iterator6[_i9++];
	          } else {
	            _i9 = _iterator6.next();
	            if (_i9.done) break;
	            _ref6 = _i9.value;
	          }

	          var _a5 = _ref6;

	          if (_a5.isUniqueType()) {
	            var key = _a5.uri() + ':' + msgs[i].getHash();
	            msgsByAuthor[key] = msgs[i];
	          }
	        }
	      }
	      this.debug('...done');
	    } else {
	      throw 'msgs param must be an array';
	    }
	    var msgAuthors = _Object$keys(msgsByAuthor).sort();
	    if (!msgAuthors.length) {
	      return;
	    }
	    var initialMsgCount = void 0,
	        msgCountAfterwards = void 0;
	    var index = this.gun.get('identitiesBySearchKey');

	    var _loop2 = async function _loop2() {
	      var knownIdentities = [];
	      var stop = false;
	      searchText(index, function (result) {
	        if (stop) {
	          return;
	        }
	        knownIdentities.push(result);
	      }, '');
	      await new _Promise(function (r) {
	        return setTimeout(r, 2000);
	      }); // wait for results to accumulate
	      stop = true;
	      knownIdentities.sort(function (a, b) {
	        if (a.key === b.key) {
	          return 0;
	        } else if (a.key > b.key) {
	          return 1;
	        } else {
	          return -1;
	        }
	      });
	      var i = 0;
	      var author = msgAuthors[i];
	      var knownContact = knownIdentities.shift();
	      initialMsgCount = msgAuthors.length;
	      // sort-merge join identitiesBySearchKey and msgsByAuthor
	      while (author && knownContact) {
	        if (author.indexOf(knownContact.key) === 0) {
	          try {
	            await util$1.timeoutPromise(_this11.addMessage(msgsByAuthor[author], { checkIfExists: true }), 10000);
	          } catch (e) {
	            _this11.debug('adding failed:', e, _JSON$stringify(msgsByAuthor[author], null, 2));
	          }
	          msgAuthors.splice(i, 1);
	          author = i < msgAuthors.length ? msgAuthors[i] : undefined;
	          //knownContact = knownIdentities.shift();
	        } else if (author < knownContact.key) {
	          author = i < msgAuthors.length ? msgAuthors[++i] : undefined;
	        } else {
	          knownContact = knownIdentities.shift();
	        }
	      }
	      msgCountAfterwards = msgAuthors.length;
	    };

	    do {
	      await _loop2();
	    } while (msgCountAfterwards !== initialMsgCount);
	    return true;
	  };

	  /*
	  * @returns {Object} message matching the hash
	  */


	  SocialNetwork.prototype.getMessageByHash = function getMessageByHash(hash) {
	    var _this12 = this;

	    var isIpfsUri = hash.indexOf('Qm') === 0;
	    return new _Promise(async function (resolve) {
	      var resolveIfHashMatches = async function resolveIfHashMatches(d, fromIpfs) {
	        var obj = typeof d === 'object' ? d : JSON.parse(d);
	        var m = await Message.fromSig(obj);
	        var h = void 0;
	        var republished = false;
	        if (fromIpfs) {
	          return resolve(m);
	        } else if (isIpfsUri && _this12.options.ipfs) {
	          h = await m.saveToIpfs(_this12.options.ipfs);
	          republished = true;
	        } else {
	          h = m.getHash();
	        }
	        if (h === hash || isIpfsUri && !_this12.options.ipfs) {
	          // does not check hash validity if it's an ipfs uri and we don't have ipfs
	          if (!fromIpfs && _this12.options.ipfs && _this12.writable && !republished) {
	            m.saveToIpfs(_this12.options.ipfs).then(function (ipfsUri) {
	              obj.ipfsUri = ipfsUri;
	              _this12.gun.get('messagesByHash').get(hash).put(obj);
	              _this12.gun.get('messagesByHash').get(ipfsUri).put(obj);
	            });
	          }
	          resolve(m);
	        } else {
	          console.error('queried index for message ' + hash + ' but received ' + h);
	        }
	      };
	      if (isIpfsUri && _this12.options.ipfs) {
	        _this12.options.ipfs.cat(hash).then(function (file) {
	          var s = _this12.options.ipfs.types.Buffer.from(file).toString('utf8');
	          _this12.debug('got msg ' + hash + ' from ipfs');
	          resolveIfHashMatches(s, true);
	        });
	      }
	      _this12.gun.get('messagesByHash').get(hash).on(function (d) {
	        _this12.debug('got msg ' + hash + ' from own gun index');
	        resolveIfHashMatches(d);
	      });
	      if (_this12.options.indexSync.query.enabled) {
	        _this12.gun.get('trustedIndexes').map().once(function (val, key) {
	          if (val) {
	            _this12.gun.user(key).get('iris').get('messagesByHash').get(hash).on(function (d) {
	              _this12.debug('got msg ' + hash + ' from friend\'s gun index ' + val);
	              resolveIfHashMatches(d);
	            });
	          }
	        });
	      }
	    });
	  };

	  /*
	  * @returns {Array} list of messages
	  */


	  SocialNetwork.prototype.getMessagesByTimestamp = function getMessagesByTimestamp(callback, limit, cursor) {
	    var _this13 = this;

	    var desc = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : true;
	    var filter = arguments[4];

	    var seen = {};
	    var cb = function cb(msg) {
	      if ((!limit || _Object$keys(seen).length < limit) && !Object.prototype.hasOwnProperty.call(seen, msg.hash)) {
	        seen[msg.getHash()] = true;
	        callback(msg);
	      }
	    };

	    this._getMsgs(this.gun.get('messagesByTimestamp'), cb, limit, cursor, desc, filter);
	    if (this.options.indexSync.query.enabled) {
	      this.gun.get('trustedIndexes').map().once(function (val, key) {
	        if (val) {
	          var n = _this13.gun.user(key).get('iris').get('messagesByTimestamp');
	          _this13._getMsgs(n, cb, limit, cursor, desc, filter);
	        }
	      });
	    }
	  };

	  /*
	  * @returns {Array} list of messages
	  */


	  SocialNetwork.prototype.getMessagesByDistance = function getMessagesByDistance(callback, limit, cursor, desc, filter) {
	    var _this14 = this;

	    var seen = {};
	    var cb = function cb(msg) {
	      if (!Object.prototype.hasOwnProperty.call(seen, msg.hash)) {
	        if ((!limit || _Object$keys(seen).length <= limit) && !Object.prototype.hasOwnProperty.call(seen, msg.hash)) {
	          seen[msg.hash] = true;
	          callback(msg);
	        }
	      }
	    };
	    this._getMsgs(this.gun.get('messagesByDistance'), cb, limit, cursor, desc, filter);
	    if (this.options.indexSync.query.enabled) {
	      this.gun.get('trustedIndexes').map().once(function (val, key) {
	        if (val) {
	          var n = _this14.gun.user(key).get('iris').get('messagesByDistance');
	          _this14._getMsgs(n, cb, limit, cursor, desc, filter);
	        }
	      });
	    }
	  };

	  return SocialNetwork;
	}();

	var version$2 = "0.0.132";

	/*eslint no-useless-escape: "off", camelcase: "off" */

	var index = {
	  VERSION: version$2,
	  Collection: Collection,
	  Message: Message,
	  Contact: Contact,
	  Attribute: Attribute,
	  SocialNetwork: SocialNetwork,
	  Key: Key,
	  Chat: Chat,
	  util: util$1
	};

	return index;

})));
