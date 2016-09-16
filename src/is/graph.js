/**
 * Created by Paul on 9/7/2016.
 */
import Obj from '../utilities/obj'
import IsNode from '../is/node';

let Graph = function (g, cb, fn, t) { // checks to see if an object is a valid graph.
  let exist = false;
  if (!Obj.is(g)) { return false; } // must be an object.
  return !Obj.map(g, function (n, s) { // we invert this because the way we check for this is via a negation.
      if (!n || s !== IsNode.soul(n) || !IsNode(n, fn)) {
        return true;
      } // it is true that this is an invalid graph.
      (cb || function () {
      }).call(t, n, s, function (fn) { // optional callback for each node.
        if (fn) {
          IsNode(n, fn, t);
        } // where we then have an optional callback for each field/value.
      });
      exist = true;
    }) && exist; // makes sure it wasn't an empty object.
};

Graph.ify = function (n) {
  let s; // wrap a node into a graph.
  if (s = IsNode.soul(n)) { // grab the soul from the node, if it is a node.
    return Obj.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
  }
};

export default Graph;
