import { IGunChainReference } from './chain';
import { IGunConstructorOptions } from './options';
export interface IGunStatic {
    /**
     * @description
     * no parameters creates a local datastore using the default persistence layer, either localStorage or Radisk.
     * @param options
     * passing a URL creates the above local datastore that also tries to sync with the URL.
     *
     * or you can pass in an array of URLs to sync with multiple peers.
     */
    <DataType = any>(options?: string | string[] | IGunConstructorOptions): IGunChainReference<DataType, any, 'pre_root'>;
    new <DataType = any>(options?: string | string[] | IGunConstructorOptions): IGunChainReference<DataType, any, 'pre_root'>;
    node: {
        /** Returns true if data is a gun node, otherwise false. */
        is(anything: any): anything is IGunChainReference;
        /**
         * Returns data's gun ID (instead of manually grabbing its metadata i.e. data["_"]["#"], which is faster but could change in the future)
         *
         * Returns undefined if data is not correct gun data.
         */
        soul(data: IGunChainReference): string;
        /** Returns a "gun-ified" variant of the json input by injecting a new gun ID into the metadata field. */
        ify(json: any): any;
    };
    /** @see https://gun.eco/docs/SEA */
    SEA: {
        /** If you want SEA to throw while in development, turn SEA.throw = true on, but please do not use this in production. */
        throw?: boolean;
        /** Last known error */
        err?: Error;
        /**
         * This gives you a Proof of Work (POW) / Hashing of Data
         * @param data The data to be hashed, work to be performed on.
         * @param pair (salt) You can pass pair of keys to use as salt. Salt will prevent others to pre-compute the work,
         *  so using your public key is not a good idea. If it is not specified, it will be random,
         *  which ruins your chance of ever being able to re-derive the work deterministically
         * @param callback function to executed upon execution of proof
         * @param opt default: {name: 'PBKDF2', encode: 'base64'}
         */
        work(data: any, pair?: any, callback?: (data: string | undefined) => void, opt?: Partial<{
            name: 'SHA-256' | 'PBKDF2';
            encode: 'base64' | 'base32' | 'base16';
            /** iterations to use on subtle.deriveBits */
            iterations: number;
            salt: any;
            hash: string;
            length: any;
        }>): Promise<string | undefined>;
        /**
         * This generates a cryptographically secure public/private key pair - be careful not to leak the private keys!
         * Note: API subject to change we may change the parameters to accept data and work, in addition to generation.
         * You will need this for most of SEA's API, see those method's examples.
         * The default cryptographic primitives for the asymmetric keys are ECDSA for signing and ECDH for encryption.
         */
        pair(cb: (data: CryptoKeyPair) => void, opt?: {}): Promise<CryptoKeyPair | undefined>;
        /**
         * Adds a signature to a message, for data that you want to prevent attackers tampering with.
         * @param data is the content that you want to prove is authorized.
         * @param pair is from .pair.
         */
        sign(data: any, pair: CryptoKeyPair): Promise<string | undefined>;
        /**
         * Gets the data if and only if the message can be verified as coming from the person you expect.
         * @param message is what comes from .sign.
         * @param pair from .pair or its public key text (pair.pub).
         */
        verify(message: any, pair: CryptoKeyPair | string): Promise<unknown>;
        /**
         * Takes some data that you want to keep secret and encrypts it so nobody else can read it.
         * @param data is the content that you want to encrypt.
         * @param pair from .pair or a passphrase you want to use as a cypher to encrypt with.
         */
        encrypt(data: any, pair: CryptoKeyPair | string): Promise<string>;
        /**
         * Read the secret data, if and only if you are allowed to.
         * @param message is what comes from .encrypt.
         * @param pair from .pair or the passphrase to decypher the message.
         */
        decrypt(message: any, pair: CryptoKeyPair | string): Promise<unknown>;
    };
}
