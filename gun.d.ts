import { IGun, LEX } from './types/gun';

declare const Gun: IGun;
export default Gun;

import {} from './types/gun/IGun';
declare module './types/gun/IGun' {
  export interface IGun {
    window: Window
  }
}

declare global {
  interface Window {
    Gun: IGun;
    GUN: IGun;
  }

  interface StringConstructor {
    match(t: string, o: LEX | string): boolean;
    random(length?: number, alphabet?: string): string;
  }
}
