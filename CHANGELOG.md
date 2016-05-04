# CHANGELOG

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
