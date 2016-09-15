/**
 * Created by Paul on 9/7/2016.
 */

let Time = {};
Time.is = function (t) {
  return t ? t instanceof Date : (+new Date().getTime())
}
Time.now = (function () {
    let time = Time.is, last = -Infinity, n = 0, d = 1000;
    return function () {
      let t = time();
      if (last < t) {
        n = 0;
        return last = t;
      }
      return last = t + ((n += 1) / d);
    }
  }());

export default Time;
