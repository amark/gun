import {
  _GunRoot,
  GunDataPut,
  GunCallbackPut,
  GunOptionsPut,
  GunValuePlain,
  GunDataFlat,
  LEXQuery,
  GunCallbackGet,
  IGunInstance,
  GunCallbackOn,
  GunOptionsOn,
  GunCallbackOnce,
  GunOptionsOnce,
  GunDataGet,
} from '.';

export interface IGunChain {
  _: _GunRoot;

  /**
   * Save data into gun, syncing it with your connected peers
   *
   * @param value the data to save
   * @param callback an optional callback, invoked on each acknowledgment
   * @param options `put` options
   */
  put(
    value: GunDataPut,
    callback?: GunCallbackPut,
    options?: GunOptionsPut
  ): IGunChain;

  /**
   * Where to read data from
   *
   * @param key The key is the ID or property name of the data that you saved from
   *  earlier (or that will be saved later)
   * @param callback The callback is a listener for read errors, not found, and updates.
   *  It may be called multiple times for a single request, since gun uses a reactive
   *  streaming architecture. Generally, you'll find `.not`, `.on`, and `.once` as more
   *  convenient for every day use
   */
  get<T extends GunValuePlain | GunDataFlat | never = never>(
    key: string | LEXQuery,
    callback?: GunCallbackGet<T>
  ): IGunChain;

  /**
   * Add a unique item to an unordered list. Works like a mathematical set, where each
   *  item in the list is unique. If the item is added twice, it will be merged. This
   *  means only objects, for now, are supported
   *
   * @param value the data to save
   * @param callback the callback is invoked exactly the same as `.put`, since `.set` is
   *  just a convenience wrapper around `.put`
   */
  set(value: GunDataPut | GunValuePlain, callback?: GunCallbackPut): IGunChain;

  /**
   * Move up to the parent context on the chain. Every time a new chain is created, a
   *  reference to the old context is kept to go back to
   *
   * @param amount The number of times you want to go back up the chain. `-1` will take you
   *  to the root. `Infinity` is not yet supported in TypeScript
   */
  back(amount: -1): IGunInstance;
  back(amount: number): IGunChain;
  back(): IGunChain;

  /**
   * Subscribe to updates and changes on a node or property in realtime
   *
   * @param callback Once initially and whenever the property or node you're focused on
   *  changes, this callback is immediately fired with the data as it is at that point in
   *  time. Once initially and whenever the property or node you're focused on changes,
   *  this callback is immediately fired with the data as it is at that point in time
   * @param options currently, the only option is to filter out old data, and just be
   *  given the changes. If you're listening to a node with 100 fields, and just one
   *  changes, you'll instead be passed a node with a single property representing that
   *  change rather than the full node every time
   */
  on<T extends GunValuePlain | GunDataFlat | never = never>(
    callback?: GunCallbackOn<T>,
    options?: GunOptionsOn
  ): IGunChain;

  /**
   * Removes all listeners
   */
  off(): IGunChain;

  /**
   * Get the current data without subscribing to updates. Or undefined if it cannot be
   *  found
   *
   * `.once` is synchronous and immediate (at extremely high performance) if the data has
   *  already been loaded.
   *
   * `.once` is asynchronous and on a debounce timeout while data is still being loaded
   *  - so it may be called completely out of order compared to other functions. This is
   *  intended because gun streams partials of data, so once avoids firing immediately
   *  because it may not represent the "complete" data set yet. You can control this
   *  timeout with the wait option
   *
   * `.once` fires again if you update that node from within it
   *
   * @param callback The data is the value for that chain at that given point in time.
   *  And the key is the last property name or ID of the node
   * @param options `once` options
   */
  once<T extends GunValuePlain | GunDataFlat | never = never>(
    callback?: GunCallbackOnce<T>,
    options?: GunOptionsOnce
  ): IGunChain;

  /**
   * Iterates over each property and item on a node, passing it down the chain, behaving
   *  like a forEach on your data. It also subscribes to every item as well and listens
   *  for newly inserted items. It accepts one argument:
   * - a `callback` function that transforms the data as it passes through. If the data is
   *  transformed to undefined it gets filtered out of the chain
   * - the `callback` gets two arguments (value, key) and will be called once for each
   *  key value pair in the objects that are returned from map
   *
   * If your data is cyclic and has a lot of self-references, you may receive multiple
   *  callbacks with the same result. For example: "Alice is both the president of the
   *  company, the wife of Bob, and the friend to the cat." This would return 3 times:
   * ```
   *  key: president value: alice,
   *  key: wife value: alice,
   *  key: friend value: alice
   * ```
   *
   * Here's a summary of .map() behavior depending on where it is on the chain:
   * - `users.map().on(cb)` subscribes to changes on every user and to users as they are
   *  added.
   * - `users.map().once(cb)` gets each user once, including ones that are added over
   *  time.
   * - `users.once().map().on(cb)` gets the user list once, but subscribes to changes on
   *  each of those users (not added ones).
   * - `users.once().map().once(cb)` gets the user list once, gets each of those users
   *  only once (not added ones).
   */
  map<T extends GunValuePlain | GunDataFlat | never = never>(
    callback?: (data: GunDataGet<T>, key: string) => any
  ): IGunChain;
}
