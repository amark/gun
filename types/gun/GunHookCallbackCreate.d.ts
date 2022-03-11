import { IGunHookContext, _GunRoot } from '.';

export type GunHookCallbackCreate = (
  this: IGunHookContext<_GunRoot>,
  root: _GunRoot
) => void;
