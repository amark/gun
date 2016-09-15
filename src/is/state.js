/**
 * Created by Paul on 9/8/2016.
 */
import Reserved from '../reserved';
import List from '../utilities/list';
import Utils from '../utilities/base';
import Is from '../is/base';
let GunIsVal = Is.val;

let state = function (n, f) {
  return (f && n && n._ && n._[Reserved.state] && Utils.num.is(n._[Reserved.state][f])) ? n._[Reserved.state][f] : false
} // convenience function to get the state on a field on a node and return it.

state.ify = function (l, f, v, state) { // put a field's state and value on some nodes.
  l = List.is(l) ? l : [l]; // handle a list of nodes or just one node.
  l = l.reverse();
  let d = l[0]; // we might want to inherit the state from the last node in the list.
  List.map(l, function (n, i) { // iterate over each node.
    n = n || {}; // make sure it exists.
    if (GunIsVal(v)) {
      n[f] = v
    } // if we have a value, then put it.
    n._ = n._ || {}; // make sure meta exists.
    n = n._[Reserved.state] = n._[Reserved.state] || {}; // make sure HAM state exists.
    if (i = d._[Reserved.state][f]) {
      n[f] = i
    } // inherit the state!
    if (Utils.num.is(state)) {
      n[f] = state
    } // or manually set the state.
  });
};

export default state;
