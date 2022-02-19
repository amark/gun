import { GunValueSimple, IGunChain, IGunInstanceRoot } from '.';

interface IGunSchema {
  [key: string]:
    | Exclude<
        IGunSchema,
        IGunChain<any, any, any, any> | IGunInstanceRoot<any, any>
      >
    | GunValueSimple;
}

export type GunSchema =
  | Exclude<
      IGunSchema,
      IGunChain<any, any, any, any> | IGunInstanceRoot<any, any>
    >
  | GunValueSimple;
