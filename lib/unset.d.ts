import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain {
    /**
     * After you save some data in an unordered list, you may need to remove it
     */
    unset(node: IGunChain): IGunChain;
  }
}
