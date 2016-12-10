'use strict';

var Gun = require('../../gun');

var cache = {};
var timeout = null;

/**
 * Remove all entries in the cache older than 5 minutes.
 * Reschedules itself to run again when the oldest item
 * might be too old.
 * @return {undefined}
 */
function gc () {
	var now = Date.now();
	var oldest = now;
	var maxAge = 5 * 60 * 1000;

	Gun.obj.map(cache, function (time, id) {
		oldest = Math.min(now, time);

		if ((now - time) < maxAge) {
			return;
		}

		delete cache[id];
	});

	var done = Gun.obj.empty(cache);

	// Disengage GC.
	if (done) {
		timeout = null;
		return;
	}

	// Just how old?
	var elapsed = now - oldest;

	// How long before it's too old?
	var nextGC = maxAge - elapsed;

	// Schedule the next GC event.
	timeout = setTimeout(gc, nextGC);
}

/**
 * Checks a memory-efficient cache to see if a string has been seen before.
 * @param  {String} id - A string to keep track of.
 * @return {Boolean} - Whether it's been seen recently.
 */
function duplicate (id) {

	// Have we seen this ID recently?
	var existing = cache.hasOwnProperty(id);

	// Add it to the cache.
	duplicate.track(id);

	return existing;
}

/**
 * Starts tracking an ID as a possible future duplicate.
 * @param  {String} id - The ID to track.
 * @return {String} - The same ID.
 */
duplicate.track = function (id) {
	cache[id] = Date.now();

	// Engage GC.
	if (!timeout) {
		gc();
	}

	return id;
};

/**
 * Generate a new ID and start tracking it.
 * @param  {Number} [chars] - The number of characters to use.
 * @return {String} - The newly created ID.
 */
duplicate.track.newID = function (chars) {
	var id = Gun.text.random(chars);

	return duplicate.track(id);
};

module.exports = duplicate;
