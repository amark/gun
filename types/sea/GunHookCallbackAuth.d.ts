import { GunHookMessagePut, GunUser, IGunOnEvent } from '..';

export type GunHookCallbackAuth = (
  user: GunUser,
  message: GunHookMessagePut,
  event: IGunOnEvent
) => void;
