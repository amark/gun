import {
  GunCallbackOn,
  GunDataFlat,
  GunDataGet,
  GunDataPut,
  GunMessagePut,
  GunOptionsOn,
  GunOptionsOnce,
  GunOptionsPut,
  GunValuePlain,
  IGunChain,
} from '../types/gun';

import {} from '../types/gun/IGunInstance';
declare module '../types/gun/IGunInstance' {
  export interface IGunInstance {
    /**
     * @param value the data to save
     * @param options `put` options
     */
    promPut(
      value: GunDataPut,
      options: GunOptionsPut
    ): Promise<{
      ref: IGunChain;
      ack: GunMessagePut;
    }>;

    /**
     * @param limit due to promises resolving too fast if we do not set a timer we will not be
     *  able receive any data back from gun before returning the promise works both following a
     *  `Chain.get` and a `Chain.map` (limit only applies to map). If no limit is chosen,
     *  defaults to 100 ms (quite sufficient to fetch about 2000 nodes or more)
     * @param options `once` options
     */
    promOnce<T extends GunValuePlain | GunDataFlat | never>(
      limit: number,
      options: GunOptionsOnce
    ): Promise<{
      ref: IGunChain;
      data: GunDataGet<T>;
      key: string;
    }>;

    /**
     * @param value the data to save
     * @param options `put` options
     */
    promPut(
      value: GunDataPut,
      options: GunOptionsPut
    ): Promise<{
      ref: IGunChain;
      ack: GunMessagePut;
    }>;

    /**
     * @param value the data to save
     * @param options `put` options
     */
    promSet(
      value: GunDataPut | GunValuePlain,
      options: GunOptionsPut
    ): Promise<{
      ref: IGunChain;
      ack: GunMessagePut;
    }>;

    /**
     * @param callback function to be called upon changes to data
     * @param options `put` options
     */
    promOn<T extends GunValuePlain | GunDataFlat | never = never>(
      callback: GunCallbackOn<T>,
      options: GunOptionsOn
    ): Promise<GunDataGet<T>>;
  }
}
