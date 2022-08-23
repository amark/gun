import {
  _GunRoot,
  GunCallbackPut,
  GunOptionsPut,
  IGunChain,
  LEXQuery,
  GunOptions,
  IGunInstanceHookHandler,
  GunSchema,
  GunCallbackGet,
  GunSoul,
} from '.';
import { GunSoul2Soul, GunSoul2TNode } from '../utils';

export interface IGunInstanceRoot<
  TNode extends Record<string, GunSchema>,
  TGunInstance extends IGunInstanceRoot<TNode, any>
> extends IGunInstanceHookHandler {
  _: _GunRoot;

  /**
   * Save data into gun, syncing it with your connected peers
   *
   * @param value the data to save
   * @param callback an optional callback, invoked on each acknowledgment
   * @param options `put` options
   * @param options.cert certificate that gives other people write permission
   */
  put<V extends Partial<TNode> & Record<string, GunSchema>>(
    value: V,
    callback?: GunCallbackPut,
    options?: GunOptionsPut
  ): TGunInstance;

  /**
   * Where to read data from
   *
   * @param soul The soul of an object that you saved from earlier
   * @param callback The callback is a listener for read errors, not found, and updates.
   *  It may be called multiple times for a single request, since gun uses a reactive
   *  streaming architecture. Generally, you'll find `.not`, `.on`, and `.once` as more
   *  convenient for every day use
   */
  get<
    V extends GunSoul2TNode<S>,
    S extends GunSoul<GunSchema>,
    N extends TNode
  >(
    soul: S,
    callback?: GunCallbackGet<N, GunSoul2Soul<S>>
  ): IGunChain<V, TGunInstance, TGunInstance, GunSoul2Soul<S>>;

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
  get<
    V extends N[K],
    K extends keyof N & string = keyof TNode & string,
    N extends TNode = TNode
  >(
    key: K,
    callback?: GunCallbackGet<N, K>
  ): IGunChain<V, TGunInstance, TGunInstance, K>;

  /**
   * Where to read data from
   *
   * @param query LEX query
   * @param callback The callback is a listener for read errors, not found, and updates.
   *  It may be called multiple times for a single request, since gun uses a reactive
   *  streaming architecture. Generally, you'll find `.not`, `.on`, and `.once` as more
   *  convenient for every day use
   */
  get<V extends N[K], K extends keyof N & string, N extends TNode = TNode>(
    query: LEXQuery<K>,
    callback?: GunCallbackGet<N, K>
  ): IGunChain<V, TGunInstance, TGunInstance, K>;

  /**
   * Change the configuration of the gun database instance
   *
   * @param options The options argument is the same object you pass to the constructor.
   *  The options's properties replace those in the instance's configuration but
   *  `options.peers` are added to peers known to the gun instance
   */
  opt(options: GunOptions): void;
}
