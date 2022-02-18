import { GunDataNode, GunSchema } from '.';

export type GunCallbackMap<
  V extends N[K],
  K extends keyof N & string,
  N extends GunSchema
> = (data: GunDataNode<V extends GunSchema ? V : never>, key: K) => any;
