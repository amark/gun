import { IGunHookContext, _GunRoot } from '.';

export type GunHookCallbackOpt = (this: IGunHookContext<_GunRoot>, root: _GunRoot) => void;
