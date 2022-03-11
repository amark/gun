import { GunNodePut, IGunHookContext, _GunRoot } from '.';

type GunHookMessagePut = {
  $: { _: _GunRoot };
  '#'?: string;
  put: GunNodePut;
};

export type GunHookCallbackPut = (
  this: IGunHookContext<GunHookMessagePut>,
  message: GunHookMessagePut
) => void;
