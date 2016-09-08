/**
 * Created by Paul on 9/8/2016.
 */
import Events from '../events';

export default function (s) {
  var from = this, gun = !from.back ? from : new this.constructor(from);//Gun(from);
  gun._ = gun._ || {};
  gun._.back = gun.back || from;
  gun.back = gun.back || from;
  gun.__ = gun.__ || from.__;
  gun._.on = gun._.on || Events.create();
  gun._.at = gun._.at || Events.at(gun._.on);
  return gun;
};
