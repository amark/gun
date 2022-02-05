import { GunValuePlain, GunDataFlat, GunDataGet } from '.';

type GunMessageGet<T extends GunValuePlain | GunDataFlat | never> = {
  /** key */
  get: string;
  /** value */
  put: GunDataGet<T>;
};

export type GunCallbackGet<T extends GunValuePlain | GunDataFlat | never> = (
  ack: GunMessageGet<T>
) => void;
