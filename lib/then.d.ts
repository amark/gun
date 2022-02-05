import { GunDataFlat, GunDataGet, GunValuePlain } from '..';

import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain {
    /**
     * Could be buggy until official!
     *
     * > Warning: Not included by default! You must include it yourself via
     *  `require('gun/lib/then.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/then.js"></script>`!
     *
     * Note: a gun chain is not promises! You must include and call `.then()` to promisify a gun
     *  chain!
     */
    then<T extends GunValuePlain | GunDataFlat | never>(): Promise<
      GunDataGet<T>
    >;

    /**
     * Could be buggy until official!
     *
     * > Warning: Not included by default! You must include it yourself via
     *  `require('gun/lib/then.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/then.js"></script>`!
     *
     * `.then()` has a cousin of `.promise()` which behaves the same way except that resolved
     *  is an object in case you need more context or metadata
     */
    promise<T extends GunValuePlain | GunDataFlat | never>(): Promise<{
      put: GunDataGet<T>;
      get: string;
      gun: IGunChain;
    }>;
  }
}