import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * > Warning: Dependency script for browser: <script src="/gun/lib/open.js"></script>`
     *
     * Loads the full object once. It is the same as open but with the behavior of once
     */
    load(
      callback: (data: TNode) => void
    ): IGunChain<TNode, TChainParent, TGunInstance, TKey>;
  }
}
