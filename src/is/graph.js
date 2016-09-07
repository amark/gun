/**
 * Created by Paul on 9/7/2016.
 */

let Graph = function (g, cb, fn, t) { // checks to see if an object is a valid graph.
  var exist = false;
  if (!Gun.obj.is(g)) {
    return false
  } // must be an object.
  return !Gun.obj.map(g, function (n, s) { // we invert this because the way we check for this is via a negation.
      if (!n || s !== Gun.is.node.soul(n) || !Gun.is.node(n, fn)) {
        return true
      } // it is true that this is an invalid graph.
      (cb || function () {
      }).call(t, n, s, function (fn) { // optional callback for each node.
        if (fn) {
          Gun.is.node(n, fn, t)
        } // where we then have an optional callback for each field/value.
      });
      exist = true;
    }) && exist; // makes sure it wasn't an empty object.
};

Graph.ify = function (n) {
  var s; // wrap a node into a graph.
  if (s = Gun.is.node.soul(n)) { // grab the soul from the node, if it is a node.
    return Gun.obj.put({}, s, n); // then create and return a graph which has a node on the matching soul property.
  }
};

export default Graph;
