import { IGunHookContext, GunPeer } from '.';

export type GunHookCallbackHi = (
  this: IGunHookContext<GunPeer>,
  peer: GunPeer
) => void;
