/**
 * Created by Paul on 9/7/2016.
 */

import Text from './text'
import List from './list'
import Obj from './obj'
import Time from './time'

let Utilities = (Gun) => {
  Gun.fns = {
    is: function (fn) {
      return (fn instanceof Function);
    }
  };
  Gun.bi = {
    is: function (b) {
      return (b instanceof Boolean || typeof b == 'boolean');
    }
  }
  Gun.num = {
    is: function (n) {
      return !List.is(n) && (Infinity === n || n - parseFloat(n) + 1 >= 0)
    }
  }

  Gun.text = Text;
  Gun.list = List;//(Gun)
  Gun.obj = Obj;//(Gun)
  Gun.time = Time;
}

export default Utilities;
