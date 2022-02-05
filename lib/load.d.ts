import { GunValuePlain, GunDataFlat } from '..';

import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain {
    /**
     * > Warning: Dependency script for browser: <script src="/gun/lib/open.js"></script>`
     *
     * Loads the full object once. It is the same as open but with the behavior of once
     */
    load(callback: (data: GunValuePlain | GunDataFlat) => void): IGunChain;
  }
}
