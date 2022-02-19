import { IGunInstanceRoot, GunSchema, IGunUserInstance } from '..';

import {} from '../gun/IGunInstance';
declare module '../gun/IGunInstance' {
  export interface IGunInstance<TNode> {
    user<
      UNode extends Record<string, GunSchema> = any,
      UNodeInstance extends IGunUserInstance<
        UNode,
        UNodeInstance,
        TNode,
        IGunInstanceRoot<TNode, IGunInstance<TNode>>
      > = any
    >(): IGunUserInstance<UNode, UNodeInstance, TNode, IGunInstanceRoot<TNode, IGunInstance<TNode>>>;
    user<
      UNode extends Record<string, GunSchema> = any,
      UNodeInstance extends IGunUserInstance<
        UNode,
        UNodeInstance,
        TNode,
        IGunInstanceRoot<TNode, IGunInstance<TNode>>
      > = any
    >(
      publicKey: string
    ): IGunUserInstance<UNode, UNodeInstance, TNode, IGunInstanceRoot<TNode, IGunInstance<TNode>>>;
  }
}
