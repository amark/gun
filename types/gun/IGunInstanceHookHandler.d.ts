import {
  GunHookCallbackCreate,
  GunHookCallbackPut,
  pany,
  GunHookCallackGet,
  GunHookCallbackOut,
  GunHookCallbackIn,
  GunHookCallbackBye,
  IGunHookContext,
} from '.';

export interface IGunInstanceHookHandler {
  /**
   * Listener for the GUN instance creation
   */
  on(event: 'create', callback: GunHookCallbackCreate): void;

  /**
   * Listener for the GUN `put` event
   */
  on(event: 'put', callback: GunHookCallbackPut): void;

  /**
   * Listener for the GUN `get` event
   *
   * @template MessageExtension extension properties for message
   */
  on<MessageExtension extends pany = pany>(
    event: 'get',
    callback: GunHookCallackGet<MessageExtension>
  ): void;

  /**
   * Listener for the GUN `out` event
   *
   * > NEVER PASS ARROW FUNCTIONS AS A CALLBACK OR YOU LOSE `this` CONTEXT!
   *
   * > NEVER FORGET TO CALL `this.to.next(message);` IF YOU WANT YOUR MESSAGE TO PASS
   *
   * @template MessageExtension extension properties for message
   * @template MetaExtension extension properties for meta data
   */
  on<MessageExtension extends pany = pany, MetaExtension extends pany = pany>(
    event: 'out',
    callback: GunHookCallbackOut<MessageExtension, MetaExtension>
  ): void;

  /**
   * Listener for the GUN `in` event
   *
   * @template MessageExtension extension properties for message
   * @template MetaExtension extension properties for meta data
   */
  on<MessageExtension extends pany = pany, MetaExtension extends pany = pany>(
    event: 'in',
    callback: GunHookCallbackIn<MessageExtension, MetaExtension>
  ): void;

  /**
   * Listener for new peers
   */
  on(
    event: 'hi',
    callback: (this: IGunHookContext<any>, peer: any) => void
  ): void;

  /**
   * Listener for leaving peers
   */
  on(event: 'bye', callback: GunHookCallbackBye): void;
}
