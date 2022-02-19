import {
  GunOptions,
  IGunInstance,
  _GunRoot,
  GunHookCallbackCreate,
  GunHookCallbackOpt,
  GunSchema,
  IGunChain,
} from '.';

export interface IGun {
  <TNode extends Record<string, GunSchema> = any>(options?: GunOptions): IGunInstance<TNode>;
  new <TNode extends Record<string, GunSchema> = any>(options?: GunOptions): IGunInstance<TNode>;

  /**
   * Returns GUN state timestamp
   */
  state(): number;

  chain: IGunChain<any> & IGunInstance<any>;

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
