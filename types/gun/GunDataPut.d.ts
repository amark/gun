import { IGunChain, GunValuePlain } from '.';

export type GunDataPut =
  | IGunChain
  | {
      [key: string]: Exclude<GunDataPut, IGunChain> | GunValuePlain;
    };
