import { AlwaysDisallowedType, DisallowPrimitives, AckCallback, Saveable, IGunCryptoKeyPair } from './types';
import { IGunConstructorOptions } from './options';

declare type ITSResolvable<R> = R | PromiseLike<R>;

export interface IGunChainReference<DataType = Record<string, any>, ReferenceKey = any, IsTop extends 'pre_root' | 'root' | false = false> {

    /**
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
    put(data: Partial<AlwaysDisallowedType<DisallowPrimitives<IsTop, DataType>>>, callback?: AckCallback | null, options?: { opt?: { cert?: string } }): IGunChainReference<DataType, ReferenceKey, IsTop>;

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
    set<K extends keyof DataType>(data: Partial<AlwaysDisallowedType<DisallowPrimitives<IsTop, DataType[K]>>>, callback?: AckCallback | null, options?: { opt?: { cert?: string } }): IGunChainReference<DataType, ReferenceKey, IsTop>;

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
    get<K extends keyof DataType>(key: Exclude<K, Array<any>>, callback?: (
        /** the raw data. Internal node of gun. Will not typed here. */
        paramA: Record<'gun' | '$' | 'root' | 'id' | 'back' | 'on' | 'tag' | 'get' | 'soul' | 'ack' | 'put', any>,
        /** the key, ID, or property name of the data. */
        paramB: Record<'off' | 'to' | 'next' | 'the' | 'on' | 'as' | 'back' | 'rid' | 'id', any>) => void): IGunChainReference<DataType[K], K, IsTop extends 'pre_root' ? 'root' : false>;

    /**
    * Change the configuration of the gun database instance.
    * @param options The options argument is the same object you pass to the constructor.
    *
    * The options's properties replace those in the instance's configuration but options.peers are **added** to peers known to the gun instance.
    * @returns No mention in the document, behavior as `ChainReference<DataType, ReferenceKey>`
    */
    opt(options: IGunConstructorOptions): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Move up to the parent context on the chain.
     *
     * Every time a new chain is created, a reference to the old context is kept to go back to.
     * @param amount The number of times you want to go back up the chain.
     * `-1` or `Infinity` will take you to the root.
     * @returns Impossible to determinate final type. You must cast it by yourself.
     */
    back(amount?: number): IGunChainReference;

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
    on(callback: (data: DisallowPrimitives<IsTop, AlwaysDisallowedType<DataType>>, key: ReferenceKey) => void, option?: {
        change: boolean;
    } | boolean): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Get the current data without subscribing to updates. Or `undefined` if it cannot be found.
     * @returns In the document, it said the return value may change in the future. Don't rely on it.
     */
    once(callback?: (data: (DisallowPrimitives<IsTop, AlwaysDisallowedType<Record<string, DataType>>>) | undefined, key: ReferenceKey) => void, option?: {
        wait: number;
    }): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Map iterates over each property and item on a node, passing it down the chain,
     * behaving like a forEach on your data.
     * It also subscribes to every item as well and listens for newly inserted items.
     */
    map(callback?: (value: DataType, key: string) => DataType | undefined): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Undocumented, but extremely useful and mentioned in the document
     *
     * Remove **all** listener on this node.
     */
    off(): void;

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
    path?(path: string | string[]): IGunChainReference;

    /**
     * Handle cases where data can't be found.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/not.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/not.js"></script>`!
     */
    not?(callback: (key: ReferenceKey) => void): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Open behaves very similarly to gun.on, except it gives you the **full depth of a document** on every update.
     * It also works with graphs, tables, or other data structures. Think of it as opening up a live connection to a document.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/open.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/open.js"></script>`!
     */
    open?(callback: (data: DataType) => void): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Loads the full object once. It is the same as `open` but with the behavior of `once`.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/load.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/load.js"></script>`!
     */
    load?(callback: (data: DataType) => void): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Returns a promise for you to use.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/then.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/then.js"></script>`!
     */
    // then?<R, TResult1 = DataType>(onfulfilled: (value: TResult1) => ITSResolvable<R>): Promise<R>;
    // then?<TResult1 = DataType>(): Promise<TResult1>;

    /**
     * Returns a promise for you to use.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/then.js')` or
     *  `<script src="https://cdn.jsdelivr.net/npm/gun/lib/then.js"></script>`!
     */
    promise?<R, TResult1 = {
        put: Record<string, DataType>;
        key: ReferenceKey;
        gun: IGunChainReference<DataType, ReferenceKey>;
    }>(onfulfilled: (value: TResult1) => ITSResolvable<R>): Promise<R>;
    promise?<TResult1 = {
        put: Record<string, DataType>;
        key: ReferenceKey;
        gun: IGunChainReference<DataType, ReferenceKey>;
    }>(): Promise<TResult1>;

    /**
     * bye lets you change data after that browser peer disconnects.
     * This is useful for games and status messages,
     * that if a player leaves you can remove them from the game or set a user's status to "away".
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/bye.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/bye.js"></script>`!
     */
    bye?(): {
        put(data: Saveable<DataType>): void;
    };

    /**
     * Say you save some data, but want to do something with it later, like expire it or refresh it.
     * Well, then `later` is for you! You could use this to easily implement a TTL or similar behavior.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/later.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/later.js"></script>`!
     */
    later?(callback: (this: IGunChainReference<DataType, ReferenceKey>, data: Record<string, DataType>, key: ReferenceKey) => void, seconds: number): IGunChainReference<DataType, ReferenceKey>;

    /**
     * After you save some data in an unordered list, you may need to remove it.
     *
     * **Warning**: Not included by default! You must include it yourself via `require('gun/lib/unset.js')` or
     * `<script src="https://cdn.jsdelivr.net/npm/gun/lib/unset.js"></script>`!
     */
    unset?<K extends keyof DataType>(data: K): IGunChainReference<DataType, ReferenceKey>;

    /**
     * Subscribes to all future events that occur on the Timegraph and retrieve a specified number of old events
     *
     * **Warning**: The Timegraph extension isn't required by default, you would need to include at "gun/lib/time.js"
     */
    time?<K extends keyof DataType>(callback: (data: DataType[K], key: ReferenceKey, time: number) => void, alsoReceiveNOldEvents?: number): IGunChainReference<DataType, ReferenceKey>;

    /** Pushes data to a Timegraph with it's time set to Gun.state()'s time */
    time?<K extends keyof DataType>(data: DataType[K]): void;

    /**
     * Creates a new user and calls callback upon completion.
     * @param alias Username or Alias which can be used to find a user.
     * @param pass Passphrase that will be extended with PBKDF2 to make it a secure way to login.
     * @param cb Callback that is to be called upon creation of the user.
     * @param opt Option Object containing options for creation. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
     */
    create(alias: string, pass: string, cb?: (ack: {
        ok: 0;
        pub: string;
    } | {
        err: string;
    }) => void, opt?: {}): IGunChainReference;

    /**
     * Authenticates a user, previously created via User.create.
     * @param alias Username or Alias which can be used to find a user.
     * @param pass Passphrase for the user
     * @param cb Callback that is to be called upon authentication of the user.
     * @param opt Option Object containing options for authentication. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
     */
    auth(alias: string, pass: string, cb?: (ack: {
        ack: 2;
        get: string;
        on: (...args: [unknown, unknown, unknown]) => unknown;
        put: {
            alias: string;
            auth: any;
            epub: string;
            pub: string;
        };
        sea: IGunCryptoKeyPair;
        soul: string;
    } | {
        err: string;
    }) => void, opt?: {}): IGunChainReference;

    /**
     * Authenticates a user, previously created via User.create.
     * @param pair Public/Private Key Pair
     * @param cb Callback that is to be called upon authentication of the user.
     * @param opt Option Object containing options for authentication. (In gun options are added at end of syntax. opt is rarely used, hence is added at the end.)
     */
    auth(pair: CryptoKeyPair, cb?: (ack: {
        ack: 2;
        get: string;
        on: (...args: [unknown, unknown, unknown]) => unknown;
        put: {
            alias: string;
            auth: any;
            epub: string;
            pub: string;
        };
        sea: IGunCryptoKeyPair;
        soul: string;
    } | {
        err: string;
    }) => void, opt?: {}): IGunChainReference;

    /**
     * Returns the key pair in the form of an object as below.
     */
    pair(): IGunCryptoKeyPair;

    /**
     * Log out currently authenticated user. Parameters are unused in the current implementation.
     * @param opt unused in current implementation.
     * @param cb unused in current implementation.
     */
    leave(opt?: never, cb?: never): IGunChainReference;

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
     * Recall saves a users credentials in sessionStorage of the browser. As long as the tab of your app is not closed the user stays logged in, even through page refreshes and reloads.
     * @param opt option object If you want to use browser sessionStorage to allow users to stay logged in as long as the session is open, set opt.sessionStorage to true
     * @param cb internally the callback is passed on to the user.auth function to log the user back in. Refer to user.auth for callback documentation.
     */
    recall(opt?: {
        sessionStorage: boolean;
    }, cb?: Parameters<IGunChainReference['auth']>[2]): IGunChainReference;

    /**
     * @param publicKey If you know a users publicKey you can get their user graph and see any unencrypted data they may have stored there.
     */
    user(publicKey?: string): IGunChainReference;
}
