# CHANGELOG

## 0.9.x

No breaking changes, but the new Radix Storage Engine (RSE) has been finally integrated and works with S3 as a backup. Expect an order of magnitude or more in cost savings, we'll report our December bill compared to November when we get it.

We have successfully benchmarked it against **1,000,000 records** doing end-to-end triple verification using our Jepsen-inspired [PANIC](https://github.com/gundb/panic-server) distritubed testing framework, doing **~4K acked writes/second** on a Macbook Air dev machine. For more information on PANIC, check out this [5 minute presentation](https://youtu.be/nTbUCTgLmkY) we did in Sweden (and the prior talk, for those interested in [porting GUN](https://github.com/amark/gun/wiki/porting-gun) out of its reference implementation of JS).

> Warning: There is a known rare edge case in RSE currently, if data is split between two chunked files, a GET will only return from the first chunk. This will be fixed soon, but we still encourage developers to run and test against it, please report any problems.

To use RSE, initialize a gun server peer with the default storage disabled, like `Gun({localStorage: false})`. Want to use it with S3? All you need to do is make sure that your environment variables are configured and it will automatically use S3, here is a [template](https://github.com/amark/gun/wiki/Using-Amazon-S3-for-Storage). This works especially well for our 1-click-deploy Heroku [demo server](http://gunjs.herokuapp.com/) with the example apps.

Finally, with **end-to-end encryption** being enabled with our Security, Encryption, Authorization (SEA) framework (check out our [P2P/decentralized crypto-identity blockchain](https://github.com/amark/gun/wiki/auth)), gun is marching towards a stable v1.0 production-ready system (it is already being used in production by a Northern European government's Navy). So if you are able to [work around the remaining bugs](https://github.com/amark/gun/issues), we would appreciate everybody efforts in experimenting and testing out gun and reporting any last hiccups **in our lead up to the v1.0**!

We will be **overhauling documentation in this v0.9.x series**, please make complaints about what is missing, and how we can make it better, so it will be polished for the v1.0! The [chatroom is actively and friendly for help](https://gitter.im/amark/gun), [StackOverflow](https://stackoverflow.com/questions/tagged/gun) for questions. And we're looking for [sponsors](https://www.patreon.com/gunDB), we **regularly get 1,200+ uniques every 2 weeks** on this repo, we've had **53% monthly growth** on our installs, and GUN is ranked in the top quarter of the top 1% of the top 1% fastest growing projects across all GitHub! If you are an Enterprise, this would be a great time to chat with us about our IoT, AI/ML, edge computing, graph, and cybersecurity solutions.

Here is towards a v1.0! Cheers.

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
