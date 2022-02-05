import {
  _GunRoot,
  GunDataPut,
  GunCallbackPut,
  GunOptionsPut,
  IGunChain,
  GunDataFlat,
  LEXQuery,
  GunCallbackGet,
  GunOptions,
  IGunInstanceHookHandler,
} from '.';

export interface IGunInstanceRoot extends IGunInstanceHookHandler {
  _: _GunRoot;

  /**
   * Save data into gun, syncing it with your connected peers
   *
   * @param value the data to save
   * @param callback an optional callback, invoked on each acknowledgment
   * @param options `put` options
   * @param options.cert certificate that gives other people write permission
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
  get<T extends GunDataFlat | never = never>(
    key: string | LEXQuery,
    callback?: GunCallbackGet<T>
  ): IGunChain;

  /**
   * Change the configuration of the gun database instance
   *
   * @param options The options argument is the same object you pass to the constructor.
   *  The options's properties replace those in the instance's configuration but
   *  `options.peers` are added to peers known to the gun instance
   */
  opt(options: GunOptions): void;
}
