export type GunUser = {
  /** Username or Alias which can be used to find a user */
  alias: string;
  // auth: string;
  /** public key for encryption */
  epub: string;
  /** public key */
  pub: string;
};
