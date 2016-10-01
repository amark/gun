/**
 * Created by Paul on 9/6/2016.
 */

function Gun(o) {
  let gun = this;
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

Gun.chain = Gun.prototype;
import {opt, chain, put, get, key, on, path, map, val, not, set, init} from './chaining';
Gun.chain.opt = opt;
Gun.chain.chain = chain;
Gun.chain.put = put;
Gun.chain.get = get;
Gun.chain.key = key;
Gun.chain.on = on;
Gun.chain.path = path;
Gun.chain.map = map;
Gun.chain.val = val;
Gun.chain.not = not;
Gun.chain.set = set;
Gun.chain.init = init;

//TODO: tests again
import Serializer from './serializer';
Gun.ify = Serializer;

import Console from './console';
Gun.log = Console;

//TODO: sucks, why event binding and not direct call?
import {opt as Bind} from './bindings';

import Request from './request';
Gun.request = Request;

export default Gun;
