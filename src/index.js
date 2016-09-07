/**
 * Created by Paul on 9/6/2016.
 */

function Gun(o) {
  var gun = this;
  if (!Gun.is(gun)) {
    return new Gun(o)
  }
  if (Gun.is(o)) {
    return gun
  }
  return gun.opt(o);
}

//TODO: Refactor to have a better organization of the things. Sometimes 2 Gun's identical objects must be sent

import Utilities from './utilities';
Utilities(Gun, Gun);

import Events from './events';
Events(Gun);

import Scheduler from './scheduler';
Scheduler(Gun);

import SpecificUtils from './specific';
SpecificUtils(Gun);

import Chaining from './chaining';
Chaining(Gun);

import Serializer from './serializer';
Serializer(Gun);

var root = this || {};
//TODO: Check why is needed to fake console
root.console = root.console || {
    log: function (s) {
      return s
    }
  }; // safe for old browsers
var console = {
  log: function (s) {
    return root.console.log.apply(root.console, arguments), s
  },
  Log: Gun.log = function (s) {
    return (!Gun.log.squelch && root.console.log.apply(root.console, arguments)), s
  }
};
console.debug = function (i, s) {
  return (Gun.log.debug && i === Gun.log.debug && Gun.log.debug++) && root.console.log.apply(root.console, arguments), s
};
Gun.log.count = function (s) {
  return Gun.log.count[s] = Gun.log.count[s] || 0, Gun.log.count[s]++
};

import Communication from './communication';
Communication(Gun, Gun);

import Request from './request';
Gun.request = Request();

export default Gun;
