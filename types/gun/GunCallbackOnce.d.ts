import { GunDataNode, GunSchema } from '.';

export type GunCallbackOnce<V extends GunSchema, K extends string> = (
  data: GunDataNode<V>,
  key: K
) => void;
