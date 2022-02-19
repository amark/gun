import { GunSchema, IGunUserInstance } from '..';

import {} from '../gun/IGunInstanceRoot';
declare module '../gun/IGunInstanceRoot' {
  export interface IGunInstanceRoot<TNode, TGunInstance> {
    user<
      UNode extends Record<string, GunSchema> = any,
      UNodeInstance extends IGunUserInstance<
        UNode,
        UNodeInstance,
        TNode,
        TGunInstance
      > = any
    >(): IGunUserInstance<UNode, UNodeInstance, TNode, TGunInstance>;
    user<
      UNode extends Record<string, GunSchema> = any,
      UNodeInstance extends IGunUserInstance<
        UNode,
        UNodeInstance,
        TNode,
        TGunInstance
      > = any
    >(
      publicKey: string
    ): IGunUserInstance<UNode, UNodeInstance, TNode, TGunInstance>;
  }
}
