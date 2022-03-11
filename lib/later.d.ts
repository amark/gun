import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * > Warning: Dependency script for browser: <script src="/gun/lib/open.js"></script>`
     *
     * Exact timing is not guaranteed! Because it uses `setTimeout` underneath. Further, after
     *  the timeout, it must then open and load the snapshot, this will likely add at least 1ms
     *  to the delay. Experimental: If this is problematic, please report it, as we can modify
     *  the implementation of later to be more precise.)
     *
     * If a process/browser has to restart, the timeout will not be called. Experimental: If
     *  this behavior is needed, please report it, as it could be added to the implementation
     *
     * Say you save some data, but want to do something with it later, like expire it or refresh
     *  it. Well, then later is for you! You could use this to easily implement a TTL or similar
     *  behavior
     *
     * @param seconds the number of seconds you want to wait before firing the callback
     */
    later(
      /**
       * @param data a safe snapshot of what you saved, including full depth documents or circular
       *  graphs, without any of the metadata
       * @param key name of the data
       */
      callback: (data: TNode, key: string) => void,
      seconds: number
    ): IGunChain<TNode, TChainParent, TGunInstance, TKey>;
  }
}
