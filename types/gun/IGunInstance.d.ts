import { IGunInstanceRoot, GunSchema } from '.';

export interface IGunInstance<TNode extends Record<string, GunSchema> = any>
  extends IGunInstanceRoot<TNode, IGunInstance<TNode>> {}
