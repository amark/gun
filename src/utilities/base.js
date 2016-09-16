/**
 * Created by Paul on 9/7/2016.
 */

import List from './definitions/list'

 let fns = {
    is: function (fn) {
      return (fn instanceof Function);
    }
  };
 let bi = {
    is: function (b) {
      return (b instanceof Boolean || typeof b == 'boolean');
    }
  };
let num = {
    is: function (n) {
      return !List.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0)
    }
  };

export default {fns, bi, num};
