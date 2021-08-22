# CHANGELOG

## 0.2020.x

`>0.2020.520` may break in-process `gun1` `gun2` message passing. Check `test/common.js` "Check multi instance message passing" for a hint and/or complain on community chat. 

 - No breaking changes to core API.
 - Storage adapter `put` event breaking change (temporary?), RAD is official now and storage adapters should be RAD plugins instead of GUN adapters.
 - GUN soul format changed from being a random UUID to being a more predictable graph path (of where initially created) to support even better offline behavior. This means `null`ing & replacing an object will not create a new but re-merge.
 - Pretty much all internal GUN utility will be deleted, these are mostly undocumented but will affect some people - they will still be available as a separate file but deprecated.
 - As the DHT gets implemented, your relay peers may automatically connect to it, so do not assume your peer is standalone. `Gun({axe: false` should help prevent this but loses you most scaling properties.
 - The 2019 -> 2020 "changes" are happening gradually, based on experimental in-production tests.
 - As always, **most important** is to ask in the [community chat](http://chat.gun.eco) if you have any issues, and to keep up to date with changes.

## 0.2019.x

Some RAD & SEA data format changes, but with as much backward compatibility as possible, tho ideally should be dropped.

## 0.9.x

No breaking changes, but the new Radix Storage Engine (RSE) has been finally integrated and works with S3 as a backup.

// Edit: commentary removed.

## 0.8.x

Adapter interfaces have changed from `Gun.on('event', cb)` to `gun.on('event', cb)`, this will force adapters to be instance specific.

`.path()` and `.not()` have been officially removed from the core bundle, you can bundle them yourself at `lib/path.js` and `lib/not.js` if you still need them.

## 0.7.x

Small breaking change to `.val(cb)`:

Previously `.val(cb)` would ONLY be called when data exists, like `.on(cb)`.

However, due to popular demand, people wanted `.val(cb)` to also get called for `.not(cb)` rather than (before) it would "wait" until data arrived.

NOTE: For dynamic paths, `.val(cb)` will still wait, like:

`gun.get('users').map().val(cb)` because the behavior of the `map()` is simply to not fire anything down the chain unless items are found.

## 0.6.x

Introduced experimental features, chaining `.val()` (no callback) and `.map(cb)` behaving as a map/reduce function.

It also upgraded the socket adapters and did end-to-end load testing and correctness testing.

## 0.5.9

GUN 0.3 -> 0.4 -> 0.5 Migration Guide:
`gun.back` -> `gun.back()`;
`gun.get(key, cb)` -> cb(err, data) -> cb(at) at.err, at.put;
`gun.map(cb)` -> `gun.map().on(cb)`;
`gun.init` -> deprecated;
`gun.put(data, cb)` -> cb(err, ok) -> cb(ack) ack.err, ack.ok;
`gun.get(key)` global/absolute -> `gun.back(-1).get(key)`;
`gun.key(key)` -> temporarily broken;

## 0.3.7

 - Catch localStorage errors.

## 0.3.6

 - Fixed S3 typo.

## 0.3.5

 - Fixed server push.

## 0.3.4

 - Breaking Change! `list.set(item)` returns the item's chain now, not the list chain.
 - Client and Server GUN servers are now more up to spec, trimmed excess HTTP/REST header data.
 - Gun.is.lex added.

## 0.3.3

- You can now link nodes natively, `gun.get('mark').path('owner').put(gun.get('cat'))`!
- Sets (or tables, collections, lists) are now easily done with `gun.get('users').set(gun.get('person/mark'))`.

## 0.3.2

Bug fixes.

## 0.3.1

Bug fixes.

## 0.3

Migration Guide! Migrate by changing `.attach(` to `.wsp(` on your server if you have one with gun. Remove `.set()` (delete it), and change `.set($DATA)` (where you call set with something) to `.path('I' + Date.now() + 'R' + Gun.text.random(5)).put($DATA)`. If you have NodeJS style callbacks in your `.get` (which documentation previously recommended that you shouldn't) they previous took `err, graph` and now they take `err, node` (which means now using callback style is fine to use). Inside of `.not()` no longer use `return` or `this`, instead (probably) use `gun` and no `return`. If you are a module developer, use `opt.wire` now instead of `opt.hooks` and message Mark since he needs to talk to you since the wire protocol has changed.

- Server side default `.wsp()` renamed from `.attach()`.
- `.set()` deprecated because it did a bunch of random inconsistent things. Its useful behavior has now become implicit (see below) or can be done explicitly.
- `.not()` it was previously common to `return` the chain inside of .not, beware that if you have code like `gun.get(key).not(function(){ return this.put({}).key(key) }).val()` cause `.val()` to be triggered twice (this is intentional, because it funnels two separate chains together) which previously didn't happen. To fix this, just don't return the chain.
- `.put()` and `.path()` do implicit `.init()` by default, turn on explicit behavior with `Gun({init: true})`.
- `.get(soul, cb)` cb is called back with `err, node` rather than `err, graph`.
- Options `opt.wire` renamed from `opt.hooks`.
- `.val()` when called empty automatically cleanly logs for convenience purposes.
- `.init()` added.
- `Gun.is.val` renamed from `Gun.is.value`.
- `Gun.is.rel` renamed from `Gun.is.soul`.
- `Gun.is.node.soul` renamed from `Gun.is.soul.on`.
- `Gun.union.ify` renamed from `Gun.union.pseudo`.
- `Gun.union.HAM` renamed from `Gun.HAM`.
- `Gun.HAM` is now the actual HAM function for conflict resolution.
- `Gun._.state` renamed from `Gun._.HAM`.
- Maximum Callstack Exceeded is less problematic now, unless you intentionally choke the thread. #95
- Putting a regex or Date or NaN is actually detected and causes an error now while before it was silent. #122 #123
- `.on()` gets called when a key is later newly made while before it did not. #116
- `.val()` should not ever get called with a relation alone (internals should resolve it), this is fixed. #132
