import { pany, IGunHookContext, GunDataGet, GunNodeGet, _GunRoot } from '.';

export type GunHookMessageIn<
  MessageExtension extends pany,
  MetaExtension extends pany
> = {
  $: { _: _GunRoot };
  '#': string;
  get?: GunNodeGet;
  put?: { [nodePath: string]: GunDataGet<pany> & { _: MetaExtension } };
} & Partial<MessageExtension>;

export type GunHookCallbackIn<
  MessageExtension extends pany,
  MetaExtension extends pany
> = (
  this: IGunHookContext<GunHookMessageIn<MessageExtension, MetaExtension>>,
  message: GunHookMessageIn<MessageExtension, MetaExtension>
) => void;
