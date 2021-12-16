import { ISEA } from '../sea/ISEA';
import { AckCallback } from './AckCallback';
import { IGunConstructorOptions } from './IGunConstructorOptions';
import { IGunDataType } from './IGunDataType';
import { IGunInstance } from './IGunInstance';
import { IGunReturnObject } from './IGunReturnObject';

export interface IGun {
    /**
     * @description
     * no parameters creates a local datastore using the default persistence layer, either localStorage or Radisk.
     * @param options
     * passing a URL creates the above local datastore that also tries to sync with the URL.
     *
     * or you can pass in an array of URLs to sync with multiple peers.
     * DataType must be type not interface
     */
     <DataType extends IGunDataType = IGunDataType>(options?: IGunConstructorOptions): IGunInstance<DataType,undefined>;
     new <DataType extends IGunDataType= IGunDataType>(options?: IGunConstructorOptions): IGunInstance<DataType,undefined>;
     readonly node: IGun;
 
     /** @see https://gun.eco/docs/SEA */
     readonly SEA: ISEA;
     readonly version: string;
     readonly chain: IGunInstance<IGunDataType,undefined>;
     readonly log: {
         (...argv: any[]): void;
         once(...argv: any[]): void;
         off: boolean;
     };
    /** Returns true if data is a gun node, otherwise false. */
    is(anything: any): anything is IGunInstance<IGunDataType, undefined>;

    /**
     * Returns data's gun ID (instead of manually grabbing its metadata i.e. data["_"]["#"], which is faster but could change in the future)
     *
     * Returns undefined if data is not correct gun data.
     */
    soul(data: IGunReturnObject<any, any>): string | undefined;

    /** Returns a "gun-ified" variant of the json input by injecting a new gun ID into the metadata field. */
    ify(json: any): any;

    state():number
}