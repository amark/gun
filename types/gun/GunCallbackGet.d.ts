import { GunDataNode, GunSchema, GunSoul } from '.';
import { GunSoul2Soul } from '../utils';

type GunMessageGet<
  N extends GunSchema,
  K extends (keyof N & string) | GunSoul2Soul<GunSoul<N>>,
  V = K extends keyof N & string ? N[K] : N
> = {
  /** key */
  get: K;
  /** value */
  put: GunDataNode<V extends GunSchema ? V : N>;
};

export type GunCallbackGet<
  N extends GunSchema,
  K extends (keyof N & string) | GunSoul2Soul<GunSoul<N>>
> = (ack: GunMessageGet<N, K>) => void;
