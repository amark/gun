import { GunSchema, GunSoul, IGunChain } from '..';

import {} from '../types/gun/IGunChain';
import { IGunChain2TNode } from '../types/utils';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * After you save some data in an unordered list, you may need to remove it
     */
    unset<
      T extends Partial<V> | GunSoul<V> | IGunChain<V, any, any, any>,
      K extends keyof TNode & string,
      V extends TNode[K] & Record<string, GunSchema>
    >(
      node: IGunChain<
        IGunChain2TNode<T>,
        IGunChain<TNode, TChainParent, TGunInstance, TKey>,
        TGunInstance,
        K
      >
    ): IGunChain<TNode, TChainParent, TGunInstance, TKey>;
  }
}
