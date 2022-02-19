import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * > Warning: `.not` has no guarantees, since data could theoretically exist on an unrelated
     *  peer that we have no knowledge of. If you only have one server, and data is synced
     *  through it, then you have a pretty reasonable assurance that a not found means that
     *  the data doesn't exist yet. Just be mindful of how you use it
     *
     * @param callack If there's reason to believe the data doesn't exist, the callback will be
     *  invoked. This can be used as a check to prevent implicitly writing data
     */
    not(
      callack: (key: string) => void
    ): IGunChain<TNode, TChainParent, TGunInstance, TKey>;
  }
}
