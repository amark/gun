import { IGunHookContext, pany, GunDataNode, GunNodeGet, _GunRoot } from '.';

export type GunHookMessageOut<
  MessageExtension extends pany,
  MetaExtension extends pany
> = {
  $: { _: _GunRoot };
  '#': string;
  get?: GunNodeGet;
  put?: { [nodePath: string]: GunDataNode<pany> & { _: MetaExtension } };
} & Partial<MessageExtension>;

export type GunHookCallbackOut<
  MessageExtension extends pany,
  MetaExtension extends pany
> = (
  this: IGunHookContext<GunHookMessageOut<MessageExtension, MetaExtension>>,
  message: GunHookMessageOut<MessageExtension, MetaExtension>
) => void;
