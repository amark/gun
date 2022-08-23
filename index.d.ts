export * from './types/gun';
export * from './types/sea';

import { IGun, LEX } from './types/gun';
import { ISEA } from './types/sea';

declare const Gun: IGun;
export default Gun;

export const SEA: ISEA;

declare global {
  const Gun: IGun;

  interface StringConstructor {
    match(t: string, o: LEX | string): boolean;
    random(length?: number, alphabet?: string): string;
  }
}
