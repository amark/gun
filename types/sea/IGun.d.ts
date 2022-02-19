import { ISEA } from '.';

import {} from '../gun/IGun';
declare module '../gun/IGun' {
  export interface IGun {
    SEA: ISEA;
  }
}
