/**
 * Created by Paul on 9/7/2016.
 */
import Reserved from '../reserved';
import Obj from '../utilities/obj';
import Utils from '../utilities/base';
import Is from '../is/base';
import Time from '../utilities/time';

import soul from './soul';
import state from './state';

let GunIsVal = Is.val;

let Node = function (n, cb, t) {
  var s; // checks to see if an object is a valid node.
  if (!Obj.is(n)) {
    return false
  } // must be an object.
  if (s = Node.soul(n)) { // must have a soul on it.
    return !Obj.map(n, function (v, f) { // we invert this because the way we check for this is via a negation.
      if (f == Reserved.meta) {
        return
      } // skip over the metadata.
      if (!GunIsVal(v)) {
        return true
      } // it is true that this is an invalid node.
      if (cb) {
        cb.call(t, v, f, n)
      } // optionally callback each field/value.
    });
  }
  return false; // nope! This was not a valid node.
};

Node.ify = function (n, s, o) { // convert a shallow object into a node.
  o = Utils.bi.is(o) ? {force: o} : o || {}; // detect options.
  n = Node.soul.ify(n, s, o.force); // put a soul on it.
  Obj.map(n, function (v, f) { // iterate over each field/value.
    if (Reserved.meta === f) {
      return
    } // ignore meta.
    Node.state.ify([n], f, v, o.state = o.state || Time.now()); // and set the state for this field and value on this node.
  });
  return n; // This will only be a valid node if the object wasn't already deep!
};

Node.soul = soul;

Node.state = state;

export default Node;
