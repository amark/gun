/**
 * Created by Paul on 9/7/2016.
 */

import Is from './base';

// let Is = function (gun) {
//   return (gun instanceof Gun);
// }; // check to see if it is a GUN instance.
//
// Is.val = function (v) { // Valid values are a subset of JSON: null, binary, number (!Infinity), text, or a soul relation. Arrays need special algorithms to handle concurrency, so they are not supported directly. Use an extension that supports them if needed but research their problems first.
//   if (v === null) {
//     return true
//   } // "deletes", nulling out fields.
//   if (v === Infinity) {
//     return false
//   } // we want this to be, but JSON does not support it, sad face.
//   if (Utils.bi.is(v) // by "binary" we mean boolean.
//     || Utils.num.is(v)
//     || Text.is(v)) { // by "text" we mean strings.
//     return true; // simple values are valid.
//   }
//   return Is.rel(v) || false; // is the value a soul relation? Then it is valid and return it. If not, everything else remaining is an invalid data type. Custom extensions can be built on top of these primitives to support other types.
// };

//rel
import Rel from './rel';
Is.rel = Rel;

//node for the sake of tests
import Node from './node';
Is.node = Node;
//graph for the sake of tests
import Graph from './graph';
Is.graph = Graph;

export default Is;
