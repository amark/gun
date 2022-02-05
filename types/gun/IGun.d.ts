import {
  GunOptions,
  IGunInstance,
  IGunChain,
  _GunRoot,
  GunHookCallbackCreate,
  GunHookCallbackOpt,
} from '.';

export interface IGun {
  (options?: GunOptions): IGunInstance;
  new (options?: GunOptions): IGunInstance;

  /**
   * Returns GUN state timestamp
   */
  state(): number;

  chain: IGunChain;

  /**
   * Listener for a GUN instance creation
   */
  on(
    event: 'create',
    callback: GunHookCallbackCreate
  ): void;

  /**
   * Listener for a GUN options update
   */
  on(
    event: 'opt',
    callback: GunHookCallbackOpt
  ): void;
}
