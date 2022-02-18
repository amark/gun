import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * Note: This will automatically load everything it can find on the context. This may sound
     *  convenient, but may be unnecessary and excessive - resulting in more bandwidth and
     *  slower load times for larger data. It could also result in your entire database being
     *  loaded, if your app is highly interconnected
     *
     * Open behaves very similarly to `gun.on`, except it gives you the full depth of a document
     *  on every update. It also works with graphs, tables, or other data structures. Think of
     *  it as opening up a live connection to a document
     *
     * @param callback The callback has 1 parameter, and will get called every time an update
     *  happens anywhere in the full depth of the data. Unlike most of the API, open does not
     *  give you a node. It gives you a copy of your data with all metadata removed. Updates to
     *  the callback will return the same data, with changes modified onto it
     */
    open(
      callback: (data: TNode) => void
    ): IGunChain<TNode, TChainParent, TGunInstance, TKey>;
  }
}
