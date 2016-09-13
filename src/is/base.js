/**
 * Created by Paul on 9/8/2016.
 */
import Utils from '../utilities/base';
import Obj from '../utilities/obj';
import Text from '../utilities/text';
import Reserved from '../reserved';
import Rel from './rel';

let Is = function (gun) {
  return (!!gun && gun.constructor && gun.constructor.name === 'Gun');
}; // check to see if it is a GUN instance.

Is.val = function (v) { // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
  if (v === null) {
    return true
  } // "deletes", nulling out fields.
  if (v === Infinity) {
    return false
  } // we want this to be, but JSON does not support it, sad face.
  if (Utils.bi.is(v) // by "binary" we mean boolean.
    || Utils.num.is(v)
    || Text.is(v)) { // by "text" we mean strings.
    return true; // simple values are valid.
  }
  return Rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
};

Is.lex = function (l) {
  var r = true;
  if (!Obj.is(l)) {
    return false
  }
  Obj.map(l, function (v, f) {
    if (!Obj.has(Reserved, f) || !(Text.is(v) || Obj.is(v))) {
      return r = false
    }
  }); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
  return r;
};

export default Is;
