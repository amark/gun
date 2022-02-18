import { GunDataNode, IGunChain } from '..';

import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * Could be buggy until official!
     *
     * Note: a gun chain is not promises! You must include and call `.then()` to promisify a gun
     *  chain!
     */
    then(): Promise<GunDataNode<TNode>>;

    /**
     * Could be buggy until official!
     *
     * `.then()` has a cousin of `.promise()` which behaves the same way except that resolved
     *  is an object in case you need more context or metadata
     */
    promise(): Promise<{
      put: GunDataNode<TNode>;
      get: TKey;
      gun: IGunChain<TNode, TChainParent, TGunInstance, TKey>;
    }>;
  }
}
