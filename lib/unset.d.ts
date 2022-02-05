import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain {
    /**
     * > Warning: Not included by default! You must include it yourself via
     *  `require('gun/lib/unset.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/unset.js"></script>`!
     *
     * After you save some data in an unordered list, you may need to remove it
     */
    unset(node: IGunChain): IGunChain;
  }
}
