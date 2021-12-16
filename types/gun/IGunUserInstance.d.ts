import { ISEAPair } from "../sea/ISEAPair";
import { And } from "../shared/And";
import { AckCallback } from "./AckCallback";
import { AuthCallback } from "./AuthCallback";
import { CreateCallback } from "./CreateCallback";
import { IGunConstructorOptions } from "./IGunConstructorOptions";
import { IGunDataType, IGunNodeDataType } from "./IGunDataType";
import { IGunFinalUserTreeMethods } from "./IGunFinalUserTreeMethods";
import { IGunReturnObject } from "./IGunReturnObject";
import { IGunTree } from "./IGunTree";

export interface IGunUserInstance<CurrentDataType extends IGunNodeDataType, TKey extends string | undefined> {
       /**
 * check out https://gun.eco/docs/User#user-secret
 * save secret that only trusted users can read
 * 
 */
        not?(callback: (key: TKey) => void): IGunUserInstance<CurrentDataType, TKey> ;
        /**
     * Say you save some data, but want to do something with it later, like expire it or refresh it.
     * Well, then `later` is for you! You could use this to easily implement a TTL or similar behavior.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/later.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/later.js"></script>`!
     */
     later?(callback: (data: CurrentDataType, key: TKey) => void, seconds: number):  IGunUserInstance<CurrentDataType, TKey> ;
     off():  IGunUserInstance<CurrentDataType, TKey>  ;
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
        put(data: Partial<CurrentDataType>, callback?: AckCallback | null, options?: { opt?: { cert?: string } }):IGunUserInstance<CurrentDataType, TKey> 
    
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
        on(callback: (data: IGunReturnObject<CurrentDataType, TKey>, key: TKey, _msg:any, _ev:any) => void, option?: {
            change: boolean;
        } | boolean, eas?:{$?:any, subs?: unknown[] | { push(arg: unknown) }}, as?:any): IGunUserInstance<CurrentDataType, TKey> | Promise<IGunReturnObject<CurrentDataType, TKey>>;
    
        /**
          * Subscribe to database event.
          * @param eventName event name that you want listen to (currently only 'auth')
          * @param callback once event fire callback
          */
        on(eventName: 'auth', cb: AuthCallback, eas?:{$?:any, subs?: unknown[] | { push(arg: unknown) }}, as?:any):IGunUserInstance<CurrentDataType, TKey> 
    
        /**
         * Get the current data without subscribing to updates. Or `undefined` if it cannot be found.
         * @returns In the document, it said the return value may change in the future. Don't rely on it.
         */
        once(callback?: (data: IGunReturnObject<CurrentDataType, TKey>, key: TKey) => void, option?: {
            wait: number;
        }): IGunUserInstance<CurrentDataType, TKey>  | Promise<IGunReturnObject<CurrentDataType, TKey>>;
    
        /**
         * Open behaves very similarly to gun.on, except it gives you the **full depth of a document** on every update.
         * It also works with graphs, tables, or other data structures. Think of it as opening up a live connection to a document.
         *
         * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/open.js')` or
         * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/open.js"></script>`!
         */
        open?(callback: (data: IGunReturnObject<CurrentDataType, TKey>) => any, opt?: { at?: any, key?: any, doc?: any, ids?: any, any?: any, meta?: any, ev?: { off?: () => {} } }, at?: Partial<CurrentDataType>): IGunUserInstance<CurrentDataType, TKey> | Promise<IGunReturnObject<CurrentDataType, TKey>>;
    
        /**
         * Loads the full object once. It is the same as `open` but with the behavior of `once`.
         *
         * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/load.js')` or
         * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/load.js"></script>`!
         */
        load?(callback: (data: IGunReturnObject<CurrentDataType, TKey>) => void, opt?: { at?: any, key?: any, doc?: any, ids?: any, any?: any, meta?: any, ev?: { off?: () => {} } }, at?: Partial<CurrentDataType>): IGunUserInstance<CurrentDataType, TKey> | Promise<IGunReturnObject<CurrentDataType, TKey>>
    
        
        /**goes back user chain */
        back(amount?:number) : IGunUserInstance<CurrentDataType, string> 
   secret(string: string, callback : (...args:unknown[])=> any): IGunUserInstance<CurrentDataType, TKey> 








    is?: {
        alias: string | ISEAPair
        epub: string
        pub: string
    }
/**
 * Creates a new user and calls callback upon completion.
 * @param alias Username or Alias which can be used to find a user.
 * @param pass Passphrase that will be extended with PBKDF2 to make it a secure way to login.
 * @param cb Callback that is to be called upon creation of the user.
 * @param opt Option Object containing options for creation. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
 */
 create(alias: string, pass: string, cb?: CreateCallback, opt?: {}): unknown;

 /**
  * Creates a new user and calls callback upon completion.
  * @param pair User cryptographic pair
  * @param cb Callback that is to be called upon creation of the user.
  * @param opt Option Object containing options for creation. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
  */
  create(pair: ISEAPair, cb?: AuthCallback, opt?: {}): unknown;
 
 /**
  * Authenticates a user, previously created via User.create.
  * @param alias Username or Alias which can be used to find a user.
  * @param pass Passphrase for the user
  * @param cb Callback that is to be called upon authentication of the user.
  * @param opt Option Object containing options for authentication. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
  */
 auth(alias: string, pass: string, cb?:AuthCallback, opt?: {}): unknown
 
 /**
  * Authenticates a user, previously created via User.create.
  * @param pair Public/Private Key Pair
  * @param cb Callback that is to be called upon authentication of the user.
  * @param opt Option Object containing options for authentication. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
  */
 auth(pair: ISEAPair, cb?: AuthCallback, opt?: {}): unknown;
 
 
 
 /**
  * Log out currently authenticated user. Parameters are unused in the current implementation.
  * @param opt unused in current implementation.
  * @param cb unused in current implementation.
  */
 leave(opt?: never, cb?: never): unknown;
 
 /**
  * Deletes a user from the current gun instance and propagates the delete to other peers.
  * @param alias Username or alias.
  * @param pass Passphrase for the user.
  * @param cb Callback that is called when the user was successfully deleted.
  */
 delete(alias: string, pass: string, cb?: (ack: {
     ok: 0;
 }) => void): Promise<void>;


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
 get<K extends keyof CurrentDataType>(key: K, callback?: (
    data: IGunReturnObject<CurrentDataType[K], string>,
    key: K) => any): 
  And<  Promise<CurrentDataType[K]>,
  CurrentDataType[K] extends IGunDataType ?
    IGunUserInstance<CurrentDataType[K], string> & IGunFinalUserTreeMethods<CurrentDataType[K], K, string> :
    IGunDataType extends CurrentDataType[K] ?
  IGunFinalUserTreeMethods<CurrentDataType[K], K, string>   & IGunUserInstance< IGunDataType  , string> 
    : IGunFinalUserTreeMethods<CurrentDataType[K], K, string>>
 
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
 set<K extends keyof CurrentDataType>(data: CurrentDataType[K], callback?: AckCallback | null, options?: { opt?: { cert?: string } }): CurrentDataType[K] extends IGunDataType? IGunUserInstance<CurrentDataType[K], string>: IGunFinalUserTreeMethods<CurrentDataType[K], K, string> ;


 opt(opt: IGunConstructorOptions): unknown

 /**
  * Recall saves a users credentials in sessionStorage of the browser. As long as the tab of your app is not closed the user stays logged in, even through page refreshes and reloads.
  * @param opt option object If you want to use browser sessionStorage to allow users to stay logged in as long as the session is open, set opt.sessionStorage to true
  * @param cb internally the callback is passed on to the user.auth function to log the user back in. Refer to user.auth for callback documentation.
  */
 recall(opt?: {
     sessionStorage: boolean;
 }, cb?: AuthCallback): IGunUserInstance<CurrentDataType, TKey>;

 map(match: IGunTree ): CurrentDataType[keyof CurrentDataType] extends IGunDataType?  IGunUserInstance<CurrentDataType[keyof CurrentDataType], string> : IGunFinalUserTreeMethods<CurrentDataType[keyof CurrentDataType], keyof CurrentDataType, string>


 map<T>(match: (data: CurrentDataType) => T ): IGunFinalUserTreeMethods<T, keyof CurrentDataType, string>
/**
 * Subscribes to all future events that occur on the Timegraph and retrieve a specified number of old events
 *
 * **Warning**: The Timegraph extension isn't required by default, you would need to include at "gun/lib/time.js"
 */
 time?<K extends keyof CurrentDataType>(callback: (data: CurrentDataType[K], key: K, time: number) => void, alsoReceiveNOldEvents?: number): CurrentDataType[K] extends IGunDataType ? IGunUserInstance<CurrentDataType[K], string>: IGunFinalUserTreeMethods<CurrentDataType[K], K, string>;

 /** Pushes data to a Timegraph with it's time set to Gun.state()'s time */
 time?<K extends keyof CurrentDataType>(data: CurrentDataType[K]): CurrentDataType[K] extends IGunDataType ? IGunUserInstance<CurrentDataType[K], string>: IGunFinalUserTreeMethods<CurrentDataType[K], K, string>;


/**
 * @param publicKey If you know a users publicKey you can get their user graph and see any unencrypted data they may have stored there.
 */
 user<TUserGraph extends IGunDataType>(): IGunUserInstance<TUserGraph, undefined>
 user(publicKey: string): IGunUserInstance<CurrentDataType, undefined>


}