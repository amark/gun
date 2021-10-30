import { AckCallback } from "./AckCallback";
import { AuthCallback } from "./AuthCallback";
import { IGunDataType } from "./IGunDataType";
import { IGunInstance } from "./IGunInstance";
import { IGunReturnObject } from "./IGunReturnObject";

export interface IGunFinalTreeMethods<TValue, TKey, TSoul> {

    not?(callback: (key: TKey) => void):  IGunFinalTreeMethods<TValue, TKey, TSoul> ;
    /**
 * Say you save some data, but want to do something with it later, like expire it or refresh it.
 * Well, then `later` is for you! You could use this to easily implement a TTL or similar behavior.
 *
 * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/later.js')` or
 * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/later.js"></script>`!
 */
 later?(callback: (data: TValue, key: TKey) => void, seconds: number):  IGunFinalTreeMethods<TValue, TKey, TSoul> ;
 off():  IGunFinalTreeMethods<TValue, TKey, TSoul> ;
    /* /**
         * Save data into gun, syncing it with your connected peers.
         *
         * * You cannot save primitive values at the root level.
         *
         * @param data You do not need to re-save the entire object every time,
         * gun will automatically merge your data into what already exists as a "partial" update.
         *
         * * `undefined`, `NaN`, `Infinity`, `array`, will be rejected.
         * * Traditional arrays are dangerous in real-time apps. Use `gun.set` instead.
         *
         * @param callback invoked on each acknowledgment
         * @param options additional options (used for specifying certs)
        */
    put(data: Partial<TValue>, callback?: AckCallback | null, options?: { opt?: { cert?: string } }): IGunFinalTreeMethods<TValue, TKey, TSoul>

    /**
     * Subscribe to updates and changes on a node or property in real-time.
     * @param option Currently, the only option is to filter out old data, and just be given the changes.
     * If you're listening to a node with 100 fields, and just one changes,
     * you'll instead be passed a node with a single property representing that change rather than the full node every time.
     * @param callback
     * Once initially and whenever the property or node you're focused on changes, this callback is immediately fired with the data as it is at that point in time.
     *
     * Since gun streams data, the callback will probably be called multiple times as new chunks come in.
     * To remove a listener call .off() on the same property or node.
     */
    on(callback: (data: IGunReturnObject<TValue, TSoul>, key: TKey,  _msg:any, _ev:any) => void, option?: {
        change: boolean;
    } | boolean, eas?:{$?:any, subs?: unknown[] | { push(arg: unknown) }}, as?:any): IGunFinalTreeMethods<TValue, TKey, TSoul> | Promise<IGunReturnObject<TValue, TSoul>>;

    /**
      * Subscribe to database event.
      * @param eventName event name that you want listen to (currently only 'auth')
      * @param callback once event fire callback
      */
    on(eventName: 'auth', cb: AuthCallback, eas?:{$?:any, subs?: unknown[] | { push(arg: unknown) }}, as?:any): IGunFinalTreeMethods<TValue, TKey, TSoul>

    /**
     * Get the current data without subscribing to updates. Or `undefined` if it cannot be found.
     * @returns In the document, it said the return value may change in the future. Don't rely on it.
     */
    once(callback?: (data: IGunReturnObject<TValue, TSoul>, key: TKey) => void, option?: {
        wait: number;
    }): IGunFinalTreeMethods<TValue, TKey, TSoul> | Promise<IGunReturnObject<TValue, TSoul>>;

    /**
     * Open behaves very similarly to gun.on, except it gives you the **full depth of a document** on every update.
     * It also works with graphs, tables, or other data structures. Think of it as opening up a live connection to a document.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/open.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/open.js"></script>`!
     */
    open?(callback: (data: IGunReturnObject<TValue, TSoul>) => any, opt?: { at?: any, key?: any, doc?: any, ids?: any, any?: any, meta?: any, ev?: { off?: () => {} } }, at?: Partial<TValue>): IGunFinalTreeMethods<TValue, TKey, TSoul> | Promise<IGunReturnObject<TValue, TSoul>>;

    /**
     * Loads the full object once. It is the same as `open` but with the behavior of `once`.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/load.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/load.js"></script>`!
     */
    load?(callback: (data: IGunReturnObject<TValue, TSoul>) => void, opt?: { at?: any, key?: any, doc?: any, ids?: any, any?: any, meta?: any, ev?: { off?: () => {} } }, at?: Partial<TValue>): IGunFinalTreeMethods<TValue, TKey, TSoul> | Promise<IGunReturnObject<TValue, TSoul>>

    
    /**goes back user chain */
    back(amount?:number) : IGunInstance<IGunDataType, string | undefined>

}