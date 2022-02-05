import {
  GunDataFlat,
  GunDataGet,
  GunHookMessagePut,
  GunValuePlain,
  IGunOnEvent,
} from '.';

export type GunCallbackOn<T extends GunValuePlain | GunDataFlat | never> = (
  data: GunDataGet<T>,
  key: string,
  message: GunHookMessagePut,
  event: IGunOnEvent
) => void;
