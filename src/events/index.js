/**
 * Created by Paul on 9/7/2016.
 */
import List from '../utilities/list';
import At from './at';

function On() { }
On.create = function () {
  let on = function (e) {
    on.event.e = e;
    on.event.s[e] = on.event.s[e] || [];
    return on;
  };
  on.emit = function (a) {
    let e = on.event.e, s = on.event.s[e], args = arguments, l = args.length;
    List.map(s, function (hear, i) {
      if (!hear.fn) {
        s.splice(i - 1, 0);
        return;
      }
      if (1 === l) {
        hear.fn(a);
        return;
      }
      hear.fn.apply(hear, args);
    });
    if (!s.length) {
      delete on.event.s[e]
    }
  };
  on.event = function (fn, i) {
    let s = on.event.s[on.event.e];
    if (!s) {
      return
    }
    let e = {
      fn: fn, i: i || 0, off: function () {
        return !(e.fn = false)
      }
    };
    return s.push(e), i ? s.sort(sort) : i, e;
  }
  on.event.s = {};
  return on;
};
let sort = List.sort('i');

let Events =  On.create()

Events.create = On.create;

Events.at = At;

export default Events;
