import { ISEA } from './types/sea/ISEA';

declare const SEA: ISEA;
export default SEA;

import {} from './types/sea/ISEA';
declare module './types/sea/ISEA' {
  export interface ISEA {
    window: Window
  }
}

import {} from './types/gun/IGun';
declare module './types/gun/IGun' {
  export interface IGun {
    SEA: ISEA;
  }
}

declare global {
  interface Window {
    SEA: ISEA;
  }
}
