import { IRadix } from './radix';

import {} from './radisk'
declare module './radisk' {
  export const Radisk: IRadisk;
  export interface IRadisk {
    Radix: IRadix;
  }
}

declare global {
  interface Window {
    Radisk: IRadisk;
  }
}
