export type GunCallbackUserCreate = (
  ack: { ok: 0; pub: string } | { err: string }
) => void;
