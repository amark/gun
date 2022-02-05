import { GunValuePlain } from '.';
import { GunNodeGet } from '.';

export type GunNodePut = GunNodeGet & {
  /** Leaf value */
  ':': GunValuePlain;
  /** Leaf timestamp */
  '>': number;
};
