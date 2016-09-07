/**
 * Created by Paul on 9/7/2016.
 */

var root = this || {};
//TODO: Check why is needed to fake console
root.console = root.console || {
    log: function (s) {
      return s
    }
  }; // safe for old browsers
let GLog = {};
var console = {
  log: function (s) {
    return root.console.log.apply(root.console, arguments), s
  },
  Log: GLog = function (s) {
    return (!GLog.squelch && root.console.log.apply(root.console, arguments)), s
  }
};
console.debug = function (i, s) {
  return (GLog.debug && i === GLog.debug && GLog.debug++) && root.console.log.apply(root.console, arguments), s
};
GLog.count = function (s) {
  return GLog.count[s] = GLog.count[s] || 0, GLog.count[s]++
};

export default GLog;
