/**
 * Created by Paul on 9/8/2016.
 */
import Reserved from '../reserved';
import Text from '../utilities/text';

let soul = function (n, s) {
  return (n && n._ && n._[s || Reserved.soul]) || false;
}; // convenience function to check to see if there is a soul on a node and return it.

soul.ify = function (n, s, o) { // put a soul on an object.
  n = n || {}; // make sure it exists.
  n._ = n._ || {}; // make sure meta exists.
  n._[Reserved.soul] = o ? s : n._[Reserved.soul] || s || Text.random(); // if it already has a soul then use that instead - unless you force the soul you want with an option.
  return n;
};

export default soul;
