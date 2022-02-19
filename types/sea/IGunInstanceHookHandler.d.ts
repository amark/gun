import { GunHookCallbackAuth } from '..';

import {} from '../gun/IGunInstanceHookHandler';
declare module '../gun/IGunInstanceHookHandler' {
  export interface IGunInstanceHookHandler {
    /** Called upon successful user authentication */
    on(event: 'auth', callback: GunHookCallbackAuth): void;
  }
}
