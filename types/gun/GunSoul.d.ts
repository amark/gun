import { GunSchema } from '.';
export type GunSoul<_N extends GunSchema, Soul extends string = string> = {
  '#': Soul;
};
