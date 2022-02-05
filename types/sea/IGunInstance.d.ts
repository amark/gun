import { GunCallbackUserAuth, IGunUserInstance } from '..';

import {} from '../gun/IGunInstanceRoot';
declare module '../gun/IGunInstanceRoot' {
  export interface IGunInstanceRoot {
    user(): IGunUserInstance;
    user(publicKey: string): IGunUserInstance;
  }
}
