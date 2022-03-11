import { GunSoul, IGunChain, IGunInstanceRoot } from '.';

export type GunSoul2TNode<T> = T extends GunSoul<infer TNode, infer _Soul>
  ? TNode
  : never;

export type GunSoul2Soul<T> = T extends GunSoul<infer _TNode, infer Soul>
  ? Soul
  : never;

export type IGunChain2TNode<T> = T extends IGunChain<
  infer TNode,
  infer _TChainParent,
  infer _TNodeRoot,
  infer _TKey
>
  ? TNode
  : never;

export type IGunInstanceRoot2TGunInstance<T> = T extends IGunInstanceRoot<
  infer _TNode,
  infer TGunInstance
>
  ? TGunInstance
  : never;
