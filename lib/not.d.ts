import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain {
    /**
     * > Warning: Not included by default!
     *  You must include it yourself via `require('gun/lib/not.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/not.js"></script>`! Handle cases where
     *  data can't be found.
     *
     * > Warning: `.not` has no guarantees, since data could theoretically exist on an unrelated
     *  peer that we have no knowledge of. If you only have one server, and data is synced
     *  through it, then you have a pretty reasonable assurance that a not found means that
     *  the data doesn't exist yet. Just be mindful of how you use it
     *
     * @param callack If there's reason to believe the data doesn't exist, the callback will be
     *  invoked. This can be used as a check to prevent implicitly writing data
     */
    not(callack: (key: string) => void): IGunChain;
  }
}
