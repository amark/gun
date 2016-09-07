/**
 * Created by Paul on 9/7/2016.
 */

let Is = function (gun) {
  return (gun instanceof Gun) ? true : false
}; // check to see if it is a GUN instance.

Is.val = function (v) { // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
  if (v === null) {
    return true
  } // "deletes", nulling out fields.
  if (v === Infinity) {
    return false
  } // we want this to be, but JSON does not support it, sad face.
  if (Gun.bi.is(v) // by "binary" we mean boolean.
    || Gun.num.is(v)
    || Gun.text.is(v)) { // by "text" we mean strings.
    return true; // simple values are valid.
  }
  return Is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
};

//rel
import Rel from './rel';
Is.rel = Rel;

Is.lex = function (l) {
  var r = true;
  if (!Gun.obj.is(l)) {
    return false
  }
  Gun.obj.map(l, function (v, f) {
    if (!Gun.obj.has(Gun._, f) || !(Gun.text.is(v) || Gun.obj.is(v))) {
      return r = false
    }
  }); // TODO: What if the lex cursor has a document on the match, that shouldn't be allowed!
  return r;
};

//node
import Node from './node';
Is.node = Node;
//graph
import Graph from './graph';
Is.graph = Graph;

export default Is;
