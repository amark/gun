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

Gun.version = 0.3;

//TODO: for the sake of tests
import Reserved from './reserved';
Gun._ = Reserved;

import { fns, bi, num, Text, List, Obj, Time } from './utilities';
Gun.fns = fns;
Gun.bi = bi;
Gun.num = num;
Gun.text = Text;
Gun.list = List;
Gun.obj = Obj;
Gun.time = Time;

import Events from './events';
Gun.on = Events;

import Schedule from './scheduler';
Gun.schedule = Schedule;

import Is from './is';
Gun.is = Is;

import {Union, HAM} from './specific';
// Gun.HAM = HAM;
Gun.union = Union;

import Chaining from './chaining';
Object.assign(Gun.prototype, Chaining);
Gun.chain = Gun.prototype;

//TODO: tests again
import Serializer from './serializer';
Gun.ify = Serializer;

import Console from './console';
Gun.log = Console;

//TODO: sucks, why event binding and not direct call?
import opt from './bindings/opt';

// import Request from './request';
// Gun.request = Request;

export default Gun;
