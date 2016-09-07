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

Gun._ = { // some reserved key words, these are not the only ones.
  meta: '_' // all metadata of the node is stored in the meta property on the node.
  , soul: '#' // a soul is a UUID of a node but it always points to the "latest" data known.
  , field: '.' // a field is a property on a node which points to a value.
  , state: '>' // other than the soul, we store HAM metadata.
  , '#': 'soul'
  , '.': 'field'
  , '=': 'value'
  , '>': 'state'
};

import { fns, bi, num } from './utilities';
Gun.fns = fns;
Gun.bi = bi;
Gun.num = num;

import Text from './utilities/text'
import List from './utilities/list'
import Obj from './utilities/obj'
import Time from './utilities/time'
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
Gun.HAM = HAM;
Gun.union = Union;

import Chaining from './chaining';
Object.assign(Gun.prototype, Chaining);
Gun.chain = Gun.prototype;

import Serializer from './serializer';
Gun.ify = Serializer;

import Console from './console';
Gun.log = Console;

import {opt as Bind} from './bindings';
Bind(Gun);

import Request from './request';
Gun.request = Request;

export default Gun;
