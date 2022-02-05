import { GunValuePlain, GunDataFlat, IGunMeta } from '.';

export type GunDataGet<T extends GunValuePlain | GunDataFlat | never> =
  T extends GunValuePlain ? T : T extends GunDataFlat ? T & IGunMeta<T> : any;
