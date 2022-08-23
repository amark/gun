import { GunDataNode, GunHookMessagePut, IGunOnEvent, GunSchema } from '.';

export type GunCallbackOn<V extends GunSchema, K extends string> = (
  data: GunDataNode<V>,
  key: K,
  message: GunHookMessagePut,
  event: IGunOnEvent
) => void;
