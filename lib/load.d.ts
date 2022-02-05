import { GunValuePlain, GunDataFlat } from '..';

import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain {
    /**
     * > Warning: Not included by default! You must include it yourself via
     *  `require('gun/lib/load.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/open.js"></script>`
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/load.js"></script>`!
     *
     * Loads the full object once. It is the same as open but with the behavior of once
     */
    load(callback: (data: GunValuePlain | GunDataFlat) => void): IGunChain;
  }
}
