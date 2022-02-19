export type GunMessagePut =
  | {
      /** if there was an error during save */
      err: string;
    }
  | {
      /** if there was a success message (none is required though) */
      ok: { '': 1 };
    };

export type GunCallbackPut = (ack: GunMessagePut) => void;
