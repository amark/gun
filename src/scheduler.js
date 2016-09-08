/**
 * Created by Paul on 9/7/2016.
 */

import List from './utilities/list';
import Time from './utilities/time';
import Utils from './utilities';

let schedule = function (state, cb) { // maybe use lru-cache?
  schedule.waiting.push({
    when: state, event: cb || function () {
    }
  });
  if (schedule.soonest < state) {
    return
  }
  schedule.set(state);
};
schedule.waiting = [];
schedule.soonest = Infinity;
schedule.sort = List.sort('when');
schedule.set = function (future) {
  if (Infinity <= (schedule.soonest = future)) {
    return
  }
  var now = Time.now(); // WAS time.is() TODO: Hmmm, this would make it hard for every gun instance to have their own version of time.
  future = (future <= now) ? 0 : (future - now);
  clearTimeout(schedule.id);
  schedule.id = setTimeout(schedule.check, future);
};
schedule.check = function () {
  var now = Time.now(), soonest = Infinity; // WAS time.is() TODO: Same as above about time. Hmmm.
  schedule.waiting.sort(schedule.sort);
  schedule.waiting = List.map(schedule.waiting, function (wait, i, map) {
      if (!wait) {
        return
      }
      if (wait.when <= now) {
        if (Utils.fns.is(wait.event)) {
          setTimeout(function () {
            wait.event()
          }, 0);
        }
      } else {
        soonest = (soonest < wait.when) ? soonest : wait.when;
        map(wait);
      }
    }) || [];
  schedule.set(soonest);
};

export default schedule;
