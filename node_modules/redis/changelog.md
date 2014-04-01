Changelog
=========

## v0.10.1 - February 17, 2014

* Skip plucking redis version from the INFO stream if INFO results weren't provided. (Robert Sköld)

## v0.10.0 - December 21, 2013

* Instead of throwing errors asynchronously, emit errors on client. (Bryce Baril)

## v0.9.2 - December 15, 2013

* Regenerate commands for new 2.8.x Redis commands. (Marek Ventur)
* Correctly time reconnect counts when using 'auth'. (William Hockey)

## v0.9.1 - November 23, 2013

* Allow hmset to accept numeric keys. (Alex Stokes)
* Fix TypeError for multiple MULTI/EXEC errors. (Kwangsu Kim)

## v0.9.0 - October 17, 2013

* Domains support. (Forrest L Norvell)

## v0.8.6 - October 2, 2013

* If error is already an Error, don't wrap it in another Error. (Mathieu M-Gosselin)
* Fix retry delay logic (Ian Babrou)
* Return Errors instead of strings where Errors are expected (Ian Babrou)
* Add experimental `.unref()` method to RedisClient (Bryce Baril / Olivier Lalonde)
* Strengthen checking of reply to prevent conflating "message" or "pmessage" fields with pub_sub replies. (Bryce Baril)

## v0.8.5 - September 26, 2013

* Add `auth_pass` option to connect and immediately authenticate (Henrik Peinar)

## v0.8.4 - June 24, 2013

Many contributed features and fixes, including:
* Ignore password set if not needed. (jbergknoff)
* Improved compatibility with 0.10.X for tests and client.end() (Bryce Baril)
* Protect connection retries from application exceptions. (Amos Barreto)
* Better exception handling for Multi/Exec (Thanasis Polychronakis)
* Renamed pubsub mode to subscriber mode (Luke Plaster)
* Treat SREM like SADD when passed an array (Martin Ciparelli)
* Fix empty unsub/punsub TypeError (Jeff Barczewski)
* Only attempt to run a callback if it one was provided (jifeng)

## v0.8.3 - April 09, 2013

Many contributed features and fixes, including:
* Fix some tests for Node.js version 0.9.x+ changes (Roman Ivanilov)
* Fix error when commands submitted after idle event handler (roamm)
* Bypass Redis for no-op SET/SETEX commands (jifeng)
* Fix HMGET + detect_buffers (Joffrey F)
* Fix CLIENT LOAD functionality (Jonas Dohse)
* Add percentage outputs to diff_multi_bench_output.js (Bryce Baril)
* Add retry_max_delay option (Tomasz Durka)
* Fix parser off-by-one errors with nested multi-bulk replies (Bryce Baril)
* Prevent parser from sinking application-side exceptions (Bryce Baril)
* Fix parser incorrect buffer skip when parsing multi-bulk errors (Bryce Baril)
* Reverted previous change with throwing on non-string values with HMSET (David Trejo)
* Fix command queue sync issue when using pubsub (Tom Leach)
* Fix compatibility with two-word Redis commands (Jonas Dohse)
* Add EVAL with array syntax (dmoena)
* Fix tests due to Redis reply order changes in 2.6.5+ (Bryce Baril)
* Added a test for the SLOWLOG command (Nitesh Sinha)
* Fix SMEMBERS order dependency in test broken by Redis changes (Garrett Johnson)
* Update commands for new Redis commands (David Trejo)
* Prevent exception from SELECT on subscriber reconnection (roamm)


## v0.8.2 - November 11, 2012

Another version bump because 0.8.1 didn't get applied properly for some mysterious reason.
Sorry about that.

Changed name of "faster" parser to "javascript".

## v0.8.1 - September 11, 2012

Important bug fix for null responses (Jerry Sievert)

## v0.8.0 - September 10, 2012

Many contributed features and fixes, including:

* Pure JavaScript reply parser that is usually faster than hiredis (Jerry Sievert)
* Remove hiredis as optionalDependency from package.json. It still works if you want it.
* Restore client state on reconnect, including select, subscribe, and monitor. (Ignacio Burgueño)
* Fix idle event (Trae Robrock)
* Many documentation improvements and bug fixes (David Trejo)

## v0.7.2 - April 29, 2012

Many contributed fixes. Thank you, contributors.

* [GH-190] - pub/sub mode fix (Brian Noguchi)
* [GH-165] - parser selection fix (TEHEK)
* numerous documentation and examples updates
* auth errors emit Errors instead of Strings (David Trejo)

## v0.7.1 - November 15, 2011

Fix regression in reconnect logic.

Very much need automated tests for reconnection and queue logic.

## v0.7.0 - November 14, 2011

Many contributed fixes. Thanks everybody.

* [GH-127] - properly re-initialize parser on reconnect
* [GH-136] - handle passing undefined as callback (Ian Babrou)
* [GH-139] - properly handle exceptions thrown in pub/sub event handlers (Felix Geisendörfer)
* [GH-141] - detect closing state on stream error (Felix Geisendörfer)
* [GH-142] - re-select database on reconnection (Jean-Hugues Pinson)
* [GH-146] - add sort example (Maksim Lin)

Some more goodies:

* Fix bugs with node 0.6
* Performance improvements
* New version of `multi_bench.js` that tests more realistic scenarios
* [GH-140] - support optional callback for subscribe commands
* Properly flush and error out command queue when connection fails
* Initial work on reconnection thresholds

## v0.6.7 - July 30, 2011

(accidentally skipped v0.6.6)

Fix and test for [GH-123]

Passing an Array as as the last argument should expand as users
expect.  The old behavior was to coerce the arguments into Strings,
which did surprising things with Arrays.

## v0.6.5 - July 6, 2011

Contributed changes:

*  Support SlowBuffers (Umair Siddique)
*  Add Multi to exports (Louis-Philippe Perron)
*  Fix for drain event calculation (Vladimir Dronnikov)

Thanks!

## v0.6.4 - June 30, 2011

Fix bug with optional callbacks for hmset.

## v0.6.2 - June 30, 2011

Bugs fixed:

*  authentication retry while server is loading db (danmaz74) [GH-101]
*  command arguments processing issue with arrays

New features:

*  Auto update of new commands from redis.io (Dave Hoover)
*  Performance improvements and backpressure controls.
*  Commands now return the true/false value from the underlying socket write(s).
*  Implement command_queue high water and low water for more better control of queueing.

See `examples/backpressure_drain.js` for more information.

## v0.6.1 - June 29, 2011

Add support and tests for Redis scripting through EXEC command.

Bug fix for monitor mode.  (forddg)

Auto update of new commands from redis.io (Dave Hoover)

## v0.6.0 - April 21, 2011

Lots of bugs fixed.

*  connection error did not properly trigger reconnection logic [GH-85]
*  client.hmget(key, [val1, val2]) was not expanding properly [GH-66]
*  client.quit() while in pub/sub mode would throw an error [GH-87]
*  client.multi(['hmset', 'key', {foo: 'bar'}]) fails [GH-92]
*  unsubscribe before subscribe would make things very confused [GH-88]
*  Add BRPOPLPUSH [GH-79]

## v0.5.11 - April 7, 2011

Added DISCARD

I originally didn't think DISCARD would do anything here because of the clever MULTI interface, but somebody
pointed out to me that DISCARD can be used to flush the WATCH set.

## v0.5.10 - April 6, 2011

Added HVALS

## v0.5.9 - March 14, 2011

Fix bug with empty Array arguments - Andy Ray

## v0.5.8 - March 14, 2011

Add `MONITOR` command and special monitor command reply parsing.

## v0.5.7 - February 27, 2011

Add magical auth command.

Authentication is now remembered by the client and will be automatically sent to the server
on every connection, including any reconnections.

## v0.5.6 - February 22, 2011

Fix bug in ready check with `return_buffers` set to `true`.

Thanks to Dean Mao and Austin Chau.

## v0.5.5 - February 16, 2011

Add probe for server readiness.

When a Redis server starts up, it might take a while to load the dataset into memory.
During this time, the server will accept connections, but will return errors for all non-INFO
commands.  Now node_redis will send an INFO command whenever it connects to a server.
If the info command indicates that the server is not ready, the client will keep trying until
the server is ready.  Once it is ready, the client will emit a "ready" event as well as the
"connect" event.  The client will queue up all commands sent before the server is ready, just
like it did before.  When the server is ready, all offline/non-ready commands will be replayed.
This should be backward compatible with previous versions.

To disable this ready check behavior, set `options.no_ready_check` when creating the client.

As a side effect of this change, the key/val params from the info command are available as
`client.server_options`.  Further, the version string is decomposed into individual elements
in `client.server_options.versions`.

## v0.5.4 - February 11, 2011

Fix excess memory consumption from Queue backing store.

Thanks to Gustaf Sjöberg.

## v0.5.3 - February 5, 2011

Fix multi/exec error reply callback logic.

Thanks to Stella Laurenzo.

## v0.5.2 - January 18, 2011

Fix bug where unhandled error replies confuse the parser.

## v0.5.1 - January 18, 2011

Fix bug where subscribe commands would not handle redis-server startup error properly.

## v0.5.0 - December 29, 2010

Some bug fixes:

* An important bug fix in reconnection logic.  Previously, reply callbacks would be invoked twice after
  a reconnect.
* Changed error callback argument to be an actual Error object.

New feature:

* Add friendly syntax for HMSET using an object.

## v0.4.1 - December 8, 2010

Remove warning about missing hiredis.  You probably do want it though.

## v0.4.0 - December 5, 2010

Support for multiple response parsers and hiredis C library from Pieter Noordhuis.
Return Strings instead of Buffers by default.
Empty nested mb reply bug fix.

## v0.3.9 - November 30, 2010

Fix parser bug on failed EXECs.

## v0.3.8 - November 10, 2010

Fix for null MULTI response when WATCH condition fails.

## v0.3.7 - November 9, 2010

Add "drain" and "idle" events.

## v0.3.6 - November 3, 2010

Add all known Redis commands from Redis master, even ones that are coming in 2.2 and beyond.

Send a friendlier "error" event message on stream errors like connection refused / reset.

## v0.3.5 - October 21, 2010

A few bug fixes.

* Fixed bug with `nil` multi-bulk reply lengths that showed up with `BLPOP` timeouts.
* Only emit `end` once when connection goes away.
* Fixed bug in `test.js` where driver finished before all tests completed.

## unversioned wasteland

See the git history for what happened before.
