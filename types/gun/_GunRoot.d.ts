import { GunOptions, IGunInstanceHookHandler } from '.';

export interface _GunRoot extends IGunInstanceHookHandler {
  $: { _: _GunRoot };

  /**
   * Current GUN options
   */
  opt: GunOptions;
}
