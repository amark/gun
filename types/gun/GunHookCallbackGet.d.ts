import { pany, IGunHookContext, GunNodeGet, _GunRoot } from '.';

type GunHookMessageGet<MessageExtension extends pany> = {
  $: { _: _GunRoot };
  '#': string;
  get: GunNodeGet;
} & Partial<MessageExtension>;

export type GunHookCallackGet<MessageExtension extends pany> = (
  this: IGunHookContext<GunHookMessageGet<MessageExtension>>,
  message: GunHookMessageGet<MessageExtension>
) => void;
