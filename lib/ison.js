/* **************************************************************************
 * A modified version of yieldable-json package that's backwards compatible
 * with GunDB's YSON implementation
 *
 * (c) Copyright IBM Corp. 2017
 *
 *  This program and the accompanying materials are made available
 *  under the terms of the Apache License v2.0 which accompanies
 *  this distribution.
 *
 *      The Apache License v2.0 is available at
 *      http://www.opensource.org/licenses/apache2.0.php
 *
 * Contributors:
 *   Multiple authors (IBM Corp.) - initial implementation and documentation
 * **************************************************************************/

;(function () {
var yson = {}, u;

let counter = 0;
let objStack = [];
let temp = '';
const limit = 100000;

function StringifyError(m) {
  this.name = 'Error';
  this.message = m;
}

/**
 * Checking for unicode and backslash characters and replaces if any.
 * @param { string }
 * @return { string }
 */

let normalize = (string, flagN) => {
  let retStr = '';
  let transform = '';
  let uc =
  '/[\\\'\u0000-\u001f\u007f-\u009f\u00ad\u0600-\u0604\u070f\u17b4' +
  '\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g';
  let unicode = new RegExp(uc);
  // Taking '\\' out of the loop to avoid change in
  // order of execution of object entries resulting
  // in unwanted side effect
  string = string.replace(/\\/gi, '\\\\');
  let escape = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
  };
  // Escape is implemented globally
  for(var pattern in escape) {
    var regex = new RegExp(pattern,'gi')
    string = string.replace(regex, escape[pattern])
  }
  unicode.lastIndex = 0;
  if (unicode.test(string)) {
    // Unicode logic here
    transform = string.replace(unicode, (a) => {
      return '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
    });
    if (flagN === 1) {
      transform += temp;
      transform += transform;
      temp = '';
      return '"' + transform + '"';
    } else if (flagN === 2) {
      return '"' + transform + '"';
    } else {
      temp += transform;
    }
  } else {
    if (flagN === 1) {
      retStr += temp;
      retStr += string;
      temp = '';
      return '"' + retStr + '"';
    } else if (flagN === 2) {
      return '"' + string + '"';
    } else {
      temp += string;
      return;
    }
  }
};

/**
 * Obtain stringified value by yielding at required intensity
 * @param { string} field
 * @param { primitive data type } container
 * @param { function or array } replacer
 * @param { number or string } space
 * @param { number } intensity
 * @return { function } yieldCPU
 */

function * stringifyYield(field, container, replacer, space, intensity) {
  let itr = 0;
  let key = '';
  let val = '';
  let length = 0;
  let tempVal = '';
  let result = '';
  let value = container[field];
  // Made scope local handling async issues
  let flag1 = 0;
  let returnStr = '';
  let subStr = '';
  let len = 0;

  // Yield the stringification at definite intervals
  if (++counter > 512 * intensity) {
    counter = 0;
    yield val;
  }

  // Call replacer if one is present (SPEC)
  if (typeof replacer === 'function') {
    value = replacer.call(container, field, value);
  }

  switch (typeof value) {
    case 'string':
      if (value.length > limit) {
        for (let l = 0; l < value.length; l += limit) {
          flag1 = 0;
          yield value;
          subStr = value.substr(l, limit);
          len += subStr.length;
          if (len === value.length)
            flag1 = 1;
          returnStr = normalize(subStr, flag1);
        }
      } else
        returnStr = normalize(value, 2);
      return returnStr;
    case 'number':
      return isFinite(value)
        ? String(value)
        : 'null';
    case 'boolean':
    case 'null':
      return String(value);
    case 'undefined':
			return;
		case 'function':
			return 'null';
    case 'object':
      if (!value)
        return 'null';

    // Manage special cases of Arrays and Objects
      let getResult = (decision) => {
        if (result.length === 0)
          if (decision)
            return '{}';
          else
          return '[]';
        else
        if (decision)
          if (space)
            return '{\n' + space + result.join(',\n' + space) + '\n' + '}';
          else
            return '{' + result.join(',') + '}';
        else
          if (space)
            return '[\n' + space + result.join(',\n' + space) + '\n' + ']';
          else
            return '[' + result.join(',') + ']';
      };

      result = [];
    // If toJSON is present, invoke it (SPEC)
			if (value && typeof value.toJSON === 'function') {
				const response = value.toJSON(field);
				if (response === undefined) {
					return undefined;
				}

				if (typeof response === "number") {
					result.push(value.toJSON(field));
				} else {
					result.push('"' + value.toJSON(field) + '"');
				}
        if (result.length === 0)
          return '{}';
        else
        if (space)
          return space + result.join(',\n' + space) + '\n';
        else
          return result.join(',');
      }
    // Array case
      if (value && value.constructor === Array) {
        length = value.length;
        for (itr = 0; itr < length; itr += 1) {
          tempVal =
          yield *stringifyYield(itr, value, replacer, space, intensity) ||
          'null';
          if (tempVal !== undefined)
            result.push(tempVal);
        }
        return getResult(false);
      }

    // Manage replacing object scenario (SPEC)
      if (replacer && typeof replacer === 'object') {
        length = replacer.length;
        for (itr = 0; itr < length; itr += 1) {
          if (typeof replacer[itr] === 'string') {
            key = replacer[itr];
            val = yield *stringifyYield(key, value, replacer, space, intensity);
            if (val !== undefined)
							result.push(normalize(key, 2) + (space
								? ': '
								: ':') + val);
          }
        }
      } else {
      // Object case
        objStack.push(value);
        for (key in value) {
          if (typeof value[key] === 'object' && value[key] !== null &&
          value[key] !== undefined) {
            if (objStack.indexOf(value[key]) !== -1) {
              return new StringifyError('Circular Structure Detected');
            } else
            objStack.push(value[key]);
          }
          if (Object.hasOwnProperty.call(value, key)) {
            val = yield *stringifyYield(key, value, replacer, space, intensity);
            if (val !== undefined)
              result.push(normalize(key, 2) + (space
              ? ': '
              : ':') + val);
          }
          objStack = objStack.filter((v, i, a) => { return v !== value[key] });
        }
        objStack = objStack.filter((v, i, a) => { return v !== value });
      }
      return getResult(true);
    default:
      return new StringifyError('Unexpected Character');
  }
}

/**
 * Calling appropriate functions each time.
 * @param { primitive data types } value
 * @param { function or array } replacer
 * @param { number or string } space
 * @param { number } intensity
 * @param { function } callback
 * @return { function } yieldCPU
 */

let stringifyWrapper = (value, replacer, space, intensity, callback) => {
  let indent = '';
  if (typeof space === 'number') {
    indent = ' '.repeat(space);
  } else if (typeof space === 'string') {
    indent = space;
  }

  let yielding;

  // To hold 'stringifyYield' genarator function
  function * yieldBridge() {
    yielding = yield *stringifyYield('', {'': value}, replacer, indent, 1);
  }

  let rs = yieldBridge();
  let g = rs.next();

  let yieldCPU = () => {
    setTimeout(() => {
      g = rs.next();
      if (g && g.done === true) {
        // Reinitializing the values at the end of API call
        counter = 0;
        temp = ''
        objStack = [];
        if (typeof yielding === 'object')
          return callback(yielding, null);
        else
          return callback(null, yielding);
      }
      yieldCPU();
    }, 0);
  };
  return yieldCPU();
};

/**
 * This method parses a JSON text to produce an object or array.
 * It can throw a SyntaxError exception, if the string is malformed.
 * @param { string } text
 * @param { function or array } reviver
 * @param { number } intensity
 * @param { function } cb
 * @return { function } yieldCPU
 */
let parseWrapper = (text, reviver, intensity, cb) => {
  let counter = 0;
  let keyN = 0;
  let parseStr = text;
  let at = 0;
  let ch = ' ';
  let word = '';
  function ParseError(m) {
    this.name = 'ParseError';
    this.message = m;
    this.text = parseStr;
  }

  // Seek to the next character, after skipping white spaces, if any.
  let seek = () => {
    ch = parseStr.charAt && parseStr.charAt(at);
    at++;
    while (ch && ch <= ' ') {
      seek();
    }
    return ch;
  };

  // Seek to the previous character, required in some special cases.
  let unseek = () => {
    ch = parseStr.charAt(--at);
  };

  // Match 'true', 'false' and  'null' built-ins.
  let wordCheck = () => {
    word = '';
    do {
      word += ch;
      seek();
    } while (ch.match(/[a-z]/i));
    parseStr = parseStr.slice(at - 1);
    at = 0;
    return word;
  };

  // Process strings specially.
  let normalizeUnicodedString = () => {
    let inQuotes = ' ';
    let tempIndex = at;
    let index = 0;
    let slash = 0;
    let c = '"';
    while (c) {
      index = parseStr.indexOf('"', tempIndex + 1);
      tempIndex = index;
      ch = parseStr.charAt(tempIndex - 1);
      while (ch === '\\') {
        slash++;
        ch = parseStr.charAt(tempIndex - (slash + 1));
      }
      if (slash % 2 === 0) {
        inQuotes = parseStr.substring(at, index);
        parseStr = parseStr.slice(++index);
        slash = 0;
        break;
      } else
        slash = 0;
    }

    // When parsing string values, look for " and \ characters.
    index = inQuotes.indexOf('\\');
    while (index >= 0) {
      let escapee = {
        '"': '"',
        '\'': '\'',
        '/': '/',
        '\\': '\\',
        b: '\b',
        f: '\f',
        n: '\n',
        r: '\r',
        t: '\t',
      };
      let hex = 0;
      let i = 0;
      let uffff = 0;
      at = index;
      ch = inQuotes.charAt(++at);
      if (ch === 'u') {
        uffff = 0;
        for (i = 0; i < 4; i += 1) {
          hex = parseInt(ch = inQuotes.charAt(++at), 16);
          if (!isFinite(hex)) {
            break;
          }
          uffff = uffff * 16 + hex;
        }
        inQuotes = inQuotes.slice(0, index) +
                   String.fromCharCode(uffff) + inQuotes.slice(index + 6);
        at = index;
      } else if (typeof escapee[ch] === 'string') {
        inQuotes = inQuotes.slice(0, index) +
                   escapee[ch] + inQuotes.slice(index + 2);
        at = index + 1;
      } else
        break;
      index = inQuotes.indexOf('\\', at);
    }
    at = 0;
    return inQuotes;
  };

  /**
  * This function parses the current string and returns the JavaScript
  * Object, through recursive method, and yielding back occasionally
  * based on the intensity parameter.
  * @return { object } returnObj
  */
  function * parseYield() {
    let key = '';
    let returnObj = {};
    let returnArr = [];
    let v = '';
    let inQuotes = '';
    let num = 0;
    let numHolder = '';
    let addup = () => {
      numHolder += ch;
      seek();
    };
    // Handle premitive types. eg: JSON.parse(21)
    if (typeof parseStr === 'number' || typeof parseStr === 'boolean' || typeof parseStr === "function" ||
        parseStr === null) {
      parseStr = '';
      return text;
    } else if (typeof parseStr === 'undefined') {
      parseStr = undefined;
      return text;
		} else if (parseStr.charAt && parseStr.charAt(0) === '[' && parseStr.charAt(1) === ']') {
      parseStr = '';
      return [];
    } else if (parseStr.charAt && parseStr.charAt(0) === '{' && parseStr.charAt(1) === '}') {
      parseStr = '';
      return {};
    } else {
      // Yield the parsing work at specified intervals.
      if (++counter > 512 * intensity) {
        counter = 0;
        yield;
      }
      // Common case: non-premitive types.
      if (keyN !== 1)
        seek();
      switch (ch) {
        case '{':
        // Object case
          seek();
          if (ch === '}') {
            parseStr = parseStr.slice(at);
            at = 0;
            return returnObj;
          }
          do {
            if (ch !== '"')
              seek();
            keyN = 1;
            key = yield *parseYield();
            keyN = 0;
            seek();
            returnObj[key] = yield *parseYield();
            seek();
            if (ch === '}') {
              parseStr = parseStr.slice(at);
              at = 0;
              return returnObj;
            }
          } while (ch === ',');
          return new ParseError('Bad object');
        case '[':
        // Array case
          seek();
          if (ch === ']') {
            parseStr = parseStr.slice(at);
            at = 0;
            return returnArr;
          }
          unseek();
          do {
            v = yield *parseYield();
            returnArr.push(v);
            seek();
            if (ch === ']') {
              parseStr = parseStr.slice(at);
              at = 0;
              return returnArr;
            }
					} while (ch === ',');
          return new ParseError('Bad array');
        case '"':
          parseStr = parseStr.slice(at - 1);
          at = 0;
          if (parseStr.charAt(0) === '"' && parseStr.charAt(1) === '"') {
            parseStr = parseStr.slice(2);
            at = 0;
            return inQuotes;
          } else {
            seek();
            return normalizeUnicodedString();
          }
        case '0':
        case '1':
        case '2':
        case '3':
        case '4':
        case '5':
        case '6':
        case '7':
        case '8':
        case '9':
        case '-':
          if (ch === '-') addup();
          do {
            addup();
            if (ch === '.' || ch === 'e' || ch === 'E' ||
              ch === '-' || ch === '+' ||
              (ch >= String.fromCharCode(65) &&
              ch <= String.fromCharCode(70)))
              addup();
          } while (ch === '-' || ch === '+' || (isFinite(ch) && ch !== ''));
          num = Number(numHolder);
          parseStr = parseStr.slice(at - 1);
          at = 0;
          return num;
        case 't':
          word = wordCheck();
          if (word === 'true')
            return true;
          else return new ParseError('Unexpected character');
        case 'f':
          word = wordCheck();
          if (word === 'false')
            return false;
          else return new ParseError('Unexpected character');
        case 'n':
          word = wordCheck();
          if (word === 'null')
            return null;
          else return new ParseError('Unexpected character');
        default:
          return new ParseError('Unexpected character');
      }
    }
  }

  /**
   * If there is a reviver function, we recursively walk the new structure,
   * passing each name/value pair to the reviver function for possible
   * transformation, starting with a temporary root object that holds the result
   * in an empty key. If there is not a reviver function, we simply return the
   * result.
   * @param { object } yieldedObject
   * @param { string } key
   * @return { function } reviver
   */
  let revive = (yieldedObject, key) => {
    let k = '';
    let v = '';
    let val = yieldedObject[key];
    if (val && typeof val === 'object') {
      for (k in val) {
        if (Object.prototype.hasOwnProperty.call(val, k)) {
          v = revive(val, k);
          if (v !== undefined)
            val[k] = v;
          else
            delete val[k];
        }
      }
    }
    return reviver.call(yieldedObject, key, val);
  };

  let yielding = '';
  // To hold 'parseYield' genarator function
  function * yieldBridge() {
    yielding = yield* parseYield();
  }
  let rs = yieldBridge();
  let gen = rs.next();

  // Main yield control logic.
  let yieldCPU = () => {
    setTimeout(() => {
      gen = rs.next();

      if (gen && gen.done === true) {
        let isEmpty = (value) => {
          if (value.charAt(0) === '}' || value.charAt(0) === ']')
            value = value.substring(1, value.length);
          return typeof value === 'string' && !value.trim();
        };
        if (typeof yielding === 'undefined')
          return cb(new ParseError('Unexpected Character'), null);
        else if (yielding instanceof ParseError)
          return cb(yielding, null);
        else if (!isEmpty(parseStr))
          return cb(new ParseError('Unexpected Character'), null);
        else {
          if (reviver !== null) {
            if (typeof reviver === 'function') {
              let result = revive({'': yielding}, '');
              return cb(null, result);
            }
          } else
            return cb(null, yielding);
        }
      }
      yieldCPU();
    }), 0;
  };
  return yieldCPU();
};

/**
 * Checks whether the provided space
 * @param { string or number } space
 * @return { string or number }
 */
 let validateSpace = (space) => {
  if (typeof space === 'number') {
    space = Math.round(space);
    if (space >= 1 && space <= 10)
      return space;
    else if (space < 1)
      return 0;
    else
      return 10;
  } else {
    if (space.length <= 10)
      return space;
    else
    return space.substr(0, 9);
  }
};

/**
 * Checks whether the provided intensity
 * @param { number } intensity
 * @return { number }
 */
let validateIntensity = (intensity) => {
  intensity = Math.round(intensity);
  if (intensity > 0 && intensity <= 32)
    return intensity;
  else if (intensity <= 0)
    return 1;
  else
    return 32;
};

yson.parseAsync = function (data, callback, reviver = null, intensity = 1) {
	//Bring parity with the in-built parser, that takes both string and buffer
	if (Buffer.isBuffer(data))
		data = data.toString();

	if (!callback)
		throw new Error('Missing Callback');


  intensity = validateIntensity(intensity);
	return parseWrapper(data, reviver, intensity, callback);
};

  /**
  * Error checking  and call of appropriate functions for JSON stringify API
  * @param { primitive data types } data
  * @param { function or array } replacer
  * @param { number or string } space
  * @param { number } intensity
  * @param { function } callback
  * @return { function } stringifyWrapper
  */
yson.stringifyAsync = function(data, callback, replacer = null, space, intensity = 1) {
  if (typeof callback !== 'function') {
    throw new TypeError('Callback is not a function');
  }
  if (typeof space === 'number' || typeof space === 'string')
    space = validateSpace(space);
  if (typeof intensity === 'number')
    intensity = validateIntensity(intensity);
  return stringifyWrapper(data, replacer, space, intensity, callback);
}

if(typeof window != ''+u){ window.YSON = yson }
try{ if(typeof module != ''+u){ module.exports = yson } }catch(e){}
if(typeof JSON != ''+u){
	JSON.parseAsync = yson.parseAsync;
	JSON.stringifyAsync = yson.stringifyAsync;
}

}());
