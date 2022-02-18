import { IGunChain2TNode } from '../types/utils.d';
import {
  GunCallbackOn,
  GunDataNode,
  GunMessagePut,
  GunOptionsOn,
  GunOptionsOnce,
  GunOptionsPut,
  IGunChain,
  GunSchema,
  GunSoul,
} from '../types/gun';

import {} from '../types/gun/IGunInstance';
declare module '../types/gun/IGunInstance' {
  export interface IGunInstance<TNode> {
    /**
     * @param value the data to save
     * @param options `put` options
     */
    promPut<V extends TNode & Record<string, GunSchema>>(
      value: V,
      options: GunOptionsPut
    ): Promise<{
      ref: IGunChain<TNode, IGunInstance<TNode>, IGunInstance<TNode>, ''>;
      ack: GunMessagePut;
    }>;
  }
}

import {} from '../types/gun/IGunChain';
declare module '../types/gun/IGunChain' {
  export interface IGunChain<TNode, TChainParent, TGunInstance, TKey> {
    /**
     * @param value the data to save
     * @param options `put` options
     */
    promPut<
      V extends
        | (TNode extends object ? Partial<TNode> : TNode)
        | GunSoul<TNode>
        | IGunChain<TNode, any, any, any>
        | IGunChain<NonNullable<TNode>, any, any, any>
    >(
      value: V,
      options: GunOptionsPut
    ): Promise<{
      ref: IGunChain<TNode, TChainParent, TGunInstance, TKey>;
      ack: GunMessagePut;
    }>;

    /**
     * @param value the data to save
     * @param options `put` options
     */
    promSet<
      V extends Partial<N> | GunSoul<N> | IGunChain<N, any, any, any>,
      K extends keyof TNode & string,
      N extends TNode[K] & Record<string, GunSchema>
    >(
      value: V,
      options: GunOptionsPut
    ): Promise<{
      ref: V extends GunSchema
        ? IGunChain<
            N,
            IGunChain<TNode, TChainParent, TGunInstance, TKey>,
            TGunInstance,
            K
          >
        : IGunChain<
            IGunChain2TNode<V>,
            IGunChain<TNode, TChainParent, TGunInstance, TKey>,
            TGunInstance,
            K
          >;
      ack: GunMessagePut;
    }>;

    /**
     * @param callback function to be called upon changes to data
     * @param options `put` options
     */
    promOn<V extends TNode>(
      callback: GunCallbackOn<V, TKey>,
      options: GunOptionsOn
    ): Promise<GunDataNode<V>>;

    /**
     * @param limit due to promises resolving too fast if we do not set a timer we will not be
     *  able receive any data back from gun before returning the promise works both following a
     *  `Chain.get` and a `Chain.map` (limit only applies to map). If no limit is chosen,
     *  defaults to 100 ms (quite sufficient to fetch about 2000 nodes or more)
     * @param options `once` options
     */
    promOnce(
      limit: number,
      options: GunOptionsOnce
    ): Promise<{
      ref: IGunChain<TNode, TChainParent, TGunInstance, TKey>;
      data: GunDataNode<TNode>;
      key: keyof IGunChain2TNode<TChainParent> & string;
    }>;
  }
}
