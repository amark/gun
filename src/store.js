/**
 * Created by Paul on 9/7/2016.
 */

import Text from './utilities/text';
import Obj from './utilities/obj';

export default function (store) {
  if(!(store.setItem && store.getItem && store.removeItem)) {
    throw new Error("Storage driver incompatible.")
  }
  let s = { };
  s.put = function (key, val, cb) {
    try {
      store.setItem(key, Text.ify(val), function (err) {
        if(err) return cb(err);
      });
    } catch (e) {
      if (cb)cb(e)
    }
  };
  s.get = function (key, cb) { /*setTimeout(function(){*/
    try {
      store.getItem(key, function (err, val) {
        if(err) return cb(err);
        cb(null, Obj.ify(val || null))
      });

    } catch (e) {
      cb(e)
    }
    /*},1)*/
  };
  s.del = function (key) {
    return store.removeItem(key, function (err) {

    })
  };
  return s;
};

