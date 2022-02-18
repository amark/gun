import { GunNodeGet, GunValueSimple } from '.';

export type GunNodePut = GunNodeGet & {
  /** Leaf value */
  ':': GunValueSimple;
  /** Leaf timestamp */
  '>': number;
};
