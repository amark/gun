import { IGunHookContext, pany, GunDataGet, GunNodeGet, _GunRoot } from '.';

export type GunHookMessageOut<
  MessageExtension extends pany,
  MetaExtension extends pany
> = {
  $: { _: _GunRoot };
  '#': string;
  get?: GunNodeGet;
  put?: { [nodePath: string]: GunDataGet<pany> & { _: MetaExtension } };
} & Partial<MessageExtension>;

export type GunHookCallbackOut<
  MessageExtension extends pany,
  MetaExtension extends pany
> = (
  this: IGunHookContext<GunHookMessageOut<MessageExtension, MetaExtension>>,
  message: GunHookMessageOut<MessageExtension, MetaExtension>
) => void;
