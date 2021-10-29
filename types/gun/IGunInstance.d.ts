
import { And } from "../shared/And";
import { AckCallback } from "./AckCallback";
import { AuthCallback } from "./AuthCallback";
import { IGunConstructorOptions } from "./IGunConstructorOptions";
import { IGunDataType, IGunNodeDataType } from "./IGunDataType";
import { IGunFinalTreeMethods } from "./IGunFinalTreeMethods";
import { IGunReturnObject } from "./IGunReturnObject";
import { IGunTree } from "./IGunTree";
import { IGunUserInstance } from "./IGunUserInstance";




export interface IGunInstance<
    CurrentTreeDataType extends IGunNodeDataType,
    TSoul extends string | undefined
    >{

        not?(callback: (key: TSoul) => void):  IGunInstance<CurrentTreeDataType, TSoul> ;
        /**
     * Say you save some data, but want to do something with it later, like expire it or refresh it.
     * Well, then `later` is for you! You could use this to easily implement a TTL or similar behavior.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/later.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/later.js"></script>`!
     */
     later?(callback: (data: CurrentTreeDataType, key: TSoul) => void, seconds: number):  IGunInstance<CurrentTreeDataType, TSoul> ;
     off():  IGunInstance<CurrentTreeDataType, TSoul> ;
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
        put(data: Partial<CurrentTreeDataType>, callback?: AckCallback | null, options?: { opt?: { cert?: string } }): IGunInstance<CurrentTreeDataType, TSoul>
    
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
        on(callback: (data: IGunReturnObject<CurrentTreeDataType, TSoul>, key: TSoul, _msg:any, _ev:any) => void, option?: {
            change: boolean;
        } | boolean, eas?:{$?:any, subs?: unknown[] | { push(arg: unknown) }}, as?:any): IGunInstance<CurrentTreeDataType, TSoul> | Promise<IGunReturnObject<CurrentTreeDataType, TSoul>>;
    
        /**
          * Subscribe to database event.
          * @param eventName event name that you want listen to (currently only 'auth')
          * @param callback once event fire callback
          */
        on(eventName: 'auth', cb: AuthCallback, eas?:{$?:any, subs?: unknown[] | { push(arg: unknown) }}, as?:any): IGunInstance<CurrentTreeDataType, TSoul>
    
        /**
         * Get the current data without subscribing to updates. Or `undefined` if it cannot be found.
         * @returns In the document, it said the return value may change in the future. Don't rely on it.
         */
        once(callback?: (data: IGunReturnObject<CurrentTreeDataType, TSoul>, key: TSoul) => void, option?: {
            wait: number;
        }): IGunInstance<CurrentTreeDataType, TSoul>| Promise<IGunReturnObject<CurrentTreeDataType, TSoul>>;
    
        /**
         * Open behaves very similarly to gun.on, except it gives you the **full depth of a document** on every update.
         * It also works with graphs, tables, or other data structures. Think of it as opening up a live connection to a document.
         *
         * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/open.js')` or
         * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/open.js"></script>`!
         */
        open?(callback: (data: IGunReturnObject<CurrentTreeDataType, TSoul>) => any, opt?: { at?: any, key?: any, doc?: any, ids?: any, any?: any, meta?: any, ev?: { off?: () => {} } }, at?: Partial<CurrentTreeDataType>): IGunInstance<CurrentTreeDataType, TSoul> | Promise<IGunReturnObject<CurrentTreeDataType, TSoul>>;
    
        /**
         * Loads the full object once. It is the same as `open` but with the behavior of `once`.
         *
         * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/load.js')` or
         * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/load.js"></script>`!
         */
        load?(callback: (data: IGunReturnObject<CurrentTreeDataType, TSoul>) => void, opt?: { at?: any, key?: any, doc?: any, ids?: any, any?: any, meta?: any, ev?: { off?: () => {} } }, at?: Partial<CurrentTreeDataType>): IGunInstance<CurrentTreeDataType, TSoul> | Promise<IGunReturnObject<CurrentTreeDataType, TSoul>>
    
        
        /**goes back user chain */
        back(amount?:number) : IGunInstance<IGunDataType, string | undefined>
/**
 * **.set does not mean 'set data', it means a Mathematical Set**
 *
 * Add a unique item to an unordered list.
 * `gun.set` works like a mathematical set, where each item in the list is unique.
 * If the item is added twice, it will be merged.
 *
 * **This means only objects, for now, are supported.**
 * @param data the object to add to the set
 * @param callback optional function to invoke when the operation is complete
 * @param options additional options (used for specifying certs)
 */
    set<K extends keyof CurrentTreeDataType>(data: CurrentTreeDataType[K], callback?: AckCallback | null, options?: { opt?: { cert?: string } }): CurrentTreeDataType[K] extends IGunDataType ? IGunInstance<CurrentTreeDataType[K], string>: IGunFinalTreeMethods<CurrentTreeDataType[K], K, string>;

/**
    * Where to read data from.
    * @param key The key is the ID or property name of the data that you saved from earlier
    *  (or that will be saved later).
    * * Note that if you use .put at any depth after a get it first reads the data and then writes, merging the data as a partial update.
    * @param callback You will usually be using gun.on or gun.once to actually retrieve your data,
    * not this callback (it is intended for more low-level control, for module and extensions).
    *
    * **Avoid use callback. The type in the document may be wrong.**
    *
    * **Here the type of callback respect to the actual behavior**
    */
get<K extends keyof CurrentTreeDataType>(key: K, callback?: (
    data: IGunReturnObject<CurrentTreeDataType[K], string>,
    key: K) => any): 
  And<  Promise<CurrentTreeDataType[K]>,
   CurrentTreeDataType[K] extends IGunDataType ?
    IGunInstance<CurrentTreeDataType[K], string> & IGunFinalTreeMethods<CurrentTreeDataType[K], K, string> :
    IGunDataType extends CurrentTreeDataType[K] ?
    IGunFinalTreeMethods<CurrentTreeDataType[K] , K, string> & IGunInstance<IGunDataType, string>
    : IGunFinalTreeMethods<CurrentTreeDataType[K], K, string>>


map<T>(match: (data: CurrentTreeDataType) => T ): IGunFinalTreeMethods<T, keyof CurrentTreeDataType, string>
 /**
  * After you save some data in an unordered list, you may need to remove it.
  *
  * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/unset.js')` or
  * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/unset.js"></script>`!
  */
 unset?<K extends keyof CurrentTreeDataType>(data: K): CurrentTreeDataType[K] extends IGunDataType ? IGunInstance<CurrentTreeDataType[K], string>: IGunFinalTreeMethods<CurrentTreeDataType[K], K, string>;
 

/**
 * Map iterates over each property and item on a node, passing it down the chain,
 * behaving like a forEach on your data.
 * It also subscribes to every item as well and listens for newly inserted items.
 */
 map(match: IGunTree): CurrentTreeDataType[keyof CurrentTreeDataType] extends IGunDataType?  IGunInstance<CurrentTreeDataType[keyof CurrentTreeDataType], string> : IGunFinalTreeMethods<CurrentTreeDataType[keyof CurrentTreeDataType], keyof CurrentTreeDataType, string>


opt(opt: IGunConstructorOptions): unknown
/**
 *
 * Path does the same thing as `.get` but has some conveniences built in.
 * @deprecated This is not friendly with type system.
 *
 * **Warning**: This extension was removed from core, you probably shouldn't be using it!
 *
 * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/path.js')` or
 * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/path.js"></script>`!
 */
path?(path: string | string[]): unknown;


/**
 * Subscribes to all future events that occur on the Timegraph and retrieve a specified number of old events
 *
 * **Warning**: The Timegraph extension isn't required by default, you would need to include at "gun/lib/time.js"
 */
time?<K extends keyof CurrentTreeDataType>(callback: (data: CurrentTreeDataType[K], key: K, time: number) => void, alsoReceiveNOldEvents?: number): CurrentTreeDataType[K] extends IGunDataType ? IGunInstance<CurrentTreeDataType[K], string>: IGunFinalTreeMethods<CurrentTreeDataType[K], K, string>;

/** Pushes data to a Timegraph with it's time set to Gun.state()'s time */
time?<K extends keyof CurrentTreeDataType>(data: CurrentTreeDataType[K]): CurrentTreeDataType[K] extends IGunDataType ? IGunInstance<CurrentTreeDataType[K], string>: IGunFinalTreeMethods<CurrentTreeDataType[K], K, string>;


/**
 * @param publicKey If you know a users publicKey you can get their user graph and see any unencrypted data they may have stored there.
 */
    user<TUserGraph extends IGunDataType>(): IGunUserInstance<TUserGraph, undefined>
    user(publicKey: string): IGunUserInstance<CurrentTreeDataType, undefined>
} 