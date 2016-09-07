/**
 * Created by Paul on 9/7/2016.
 */

let Node = function (n, cb, t) {
  var s; // checks to see if an object is a valid node.
  if (!Gun.obj.is(n)) {
    return false
  } // must be an object.
  if (s = Node.soul(n)) { // must have a soul on it.
    return !Gun.obj.map(n, function (v, f) { // we invert this because the way we check for this is via a negation.
      if (f == Gun._.meta) {
        return
      } // skip over the metadata.
      if (!Gun.is.val(v)) {
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
  o = Gun.bi.is(o) ? {force: o} : o || {}; // detect options.
  n = Node.soul.ify(n, s, o.force); // put a soul on it.
  Gun.obj.map(n, function (v, f) { // iterate over each field/value.
    if (Gun._.meta === f) {
      return
    } // ignore meta.
    Node.state.ify([n], f, v, o.state = o.state || Gun.time.now()); // and set the state for this field and value on this node.
  });
  return n; // This will only be a valid node if the object wasn't already deep!
};

Node.soul = function (n, s) {
  return (n && n._ && n._[s || Gun._.soul]) || false
}; // convenience function to check to see if there is a soul on a node and return it.

Node.soul.ify = function (n, s, o) { // put a soul on an object.
  n = n || {}; // make sure it exists.
  n._ = n._ || {}; // make sure meta exists.
  n._[Gun._.soul] = o ? s : n._[Gun._.soul] || s || Gun.text.random(); // if it already has a soul then use that instead - unless you force the soul you want with an option.
  return n;
};

Node.state = function (n, f) {
  return (f && n && n._ && n._[Gun._.state] && Gun.num.is(n._[Gun._.state][f])) ? n._[Gun._.state][f] : false
} // convenience function to get the state on a field on a node and return it.

Node.state.ify = function (l, f, v, state) { // put a field's state and value on some nodes.
  l = Gun.list.is(l) ? l : [l]; // handle a list of nodes or just one node.
  var l = l.reverse(), d = l[0]; // we might want to inherit the state from the last node in the list.
  Gun.list.map(l, function (n, i) { // iterate over each node.
    n = n || {}; // make sure it exists.
    if (Gun.is.val(v)) {
      n[f] = v
    } // if we have a value, then put it.
    n._ = n._ || {}; // make sure meta exists.
    n = n._[Gun._.state] = n._[Gun._.state] || {}; // make sure HAM state exists.
    if (i = d._[Gun._.state][f]) {
      n[f] = i
    } // inherit the state!
    if (Gun.num.is(state)) {
      n[f] = state
    } // or manually set the state.
  });
};

export default Node;
