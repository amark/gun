import { GunSchema, GunSoul, IGunMeta } from '.';

export type GunDataNode<T extends GunSchema> = T extends GunSchema & object
  ? {
      [K in keyof T]: Exclude<
        T[K],
        string | number | boolean | null | undefined
      > extends never
        ? T[K]
        :
            | GunSoul<
                Exclude<T[K], string | number | boolean | null | undefined>
              >
            | Exclude<T[K], object>;
    } & IGunMeta<T>
  : T;
