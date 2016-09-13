/**
 * Created by Paul on 9/7/2016.
 */

import Text from '../utilities/text';
import Obj from '../utilities/obj';

let s = { };

s.put = function (key, val, cb) {
  try {
    store.setItem(key, Text.ify(val))
  } catch (e) {
    if (cb)cb(e)
  }
};
s.get = function (key, cb) { /*setTimeout(function(){*/
  try {
    cb(null, Obj.ify(store.getItem(key) || null))
  } catch (e) {
    cb(e)
  }
  /*},1)*/
};
s.del = function (key) {
  return store.removeItem(key)
};

let store = (typeof localStorage === 'undefined') ? {
  setItem: function () {
  }, removeItem: function () {
  }, getItem: function () {
  }
} : localStorage;

export default s;
