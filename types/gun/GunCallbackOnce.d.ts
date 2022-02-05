import { GunValuePlain, GunDataFlat, GunDataGet } from '.';

export type GunCallbackOnce<T extends GunValuePlain | GunDataFlat | never> = (
  data: GunDataGet<T>,
  key: string
) => void;
