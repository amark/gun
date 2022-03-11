import { GunUser, ISEAPair } from '..';

export type GunCallbackUserAuth = (
  ack:
    | {
        ack: 2;
        /** ~publicKeyOfUser */
        soul: string;
        /** ~publicKeyOfUser */
        get: string;
        put: GunUser;
        sea: ISEAPair;
      }
    | { err: string }
) => void;
