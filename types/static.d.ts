import { IGunChainReference } from './chain';
import { IGunConstructorOptions } from './options';
import { IGunStaticNode } from './static/node';
import { IGunStaticSEA } from './static/sea';
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
    readonly node: IGunStaticNode;

    /** @see https://gun.eco/docs/SEA */
    readonly SEA: IGunStaticSEA;
    readonly version: string;
    readonly chain: IGunChainReference;
    readonly log: {
        (...argv: any[]): void;
        once(...argv: any[]): void;
        off: boolean;
    };
}
