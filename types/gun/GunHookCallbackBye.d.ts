import { IGunHookContext, GunPeer } from '.';

export type GunHookCallbackBye = (
  this: IGunHookContext<GunPeer>,
  peer: GunPeer
) => void;
