/**
 * Created by Paul on 9/7/2016.
 */
import Reserved from '../reserved';
import Obj from '../utilities/obj';
import Text from '../utilities/text';

let Rel = function (v) { // this defines whether an object is a soul relation or not, they look like this: {'#': 'UUID'}
  if (Obj.is(v)) { // must be an object.
    let id;
    Obj.map(v, function (s, f) { // map over the object...
      if (id) {
        return id = false;
      } // if ID is already defined AND we're still looping through the object, it is considered invalid.
      if (f == Reserved.soul && Text.is(s)) { // the field should be '#' and have a text value.
        id = s; // we found the soul!
      } else {
        return id = false; // if there exists anything else on the object that isn't the soul, then it is considered invalid.
      }
    });
    if (id) { // a valid id was found.
      return id; // yay! Return it.
    }
  }
  return false; // the value was not a valid soul relation.
};

Rel.ify = function (s) {
  let r = {};
  return Obj.put(r, Reserved.soul, s), r;
}; // convert a soul into a relation and return it.

export default Rel;
