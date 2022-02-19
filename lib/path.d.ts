import { IGunChain, GunSchema } from '../types/gun';

import {} from '../types/gun/IGunInstance';
declare module '../types/gun/IGunInstance' {
  export interface IGunInstance<TNode> {
    /**
     * > Warning: This extension was removed from core, you probably shouldn't be using it!
     *
     * Path does the same thing as get but has some conveniences built in
     *
     * Once you've changed the context, you can read, write, and path again from that field.
     *  While you can just chain one path after another, it becomes verbose, so there are two
     *  shorthand styles:
     * - dot format
     * - array format
     *
     * The dot notation can do some strange things if you're not expecting it. Under the hood,
     *  everything is changed into a string, including floating point numbers. If you use a
     *  decimal in your path, it will split into two paths...
     *
     * This can be especially confusing as the chain might never resolve to a value
     */
    path<T extends GunSchema & Record<string, GunSchema>>(
      value: string | string[]
    ): IGunChain<T, any, IGunInstance<TNode>, string>;
  }
}

import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * > Warning: This extension was removed from core, you probably shouldn't be using it!
     *
     * > Warning: Not included by default! You must
     *  include it yourself via `require('gun/lib/path.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/path.js"></script>`!
     *
     * Path does the same thing as get but has some conveniences built in
     *
     * Once you've changed the context, you can read, write, and path again from that field.
     *  While you can just chain one path after another, it becomes verbose, so there are two
     *  shorthand styles:
     * - dot format
     * - array format
     *
     * The dot notation can do some strange things if you're not expecting it. Under the hood,
     *  everything is changed into a string, including floating point numbers. If you use a
     *  decimal in your path, it will split into two paths...
     *
     * This can be especially confusing as the chain might never resolve to a value
     */
    path<T extends GunSchema & Record<string, GunSchema>>(
      value: string | string[]
    ): IGunChain<T, any, TGunInstance, string>;
  }
}
