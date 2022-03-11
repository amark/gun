import { LEX } from '..';

export interface IPolicy extends LEX {
  /** Path */
  '#'?: LEX;
  /** Key */
  '.'?: LEX;
  /**
   * Either Path string or Key string must
   * contain Certificate's Pub string
   */
  '+'?: '*';
}
