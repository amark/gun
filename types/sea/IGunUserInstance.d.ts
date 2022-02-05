import {
  GunCallbackUserAuth,
  GunCallbackUserCreate,
  OptionsUserAuth,
  ISEAPair,
  OptionsUserRecall,
  IGunInstanceRoot,
} from '..';

export interface IGunUserInstance extends IGunInstanceRoot {
  /** Creates a new user and calls callback upon completion
   * @param alias Username or Alias which can be used to find a user
   * @param password Passphrase that will be extended with PBKDF2
   *  to make it a secure way to login
   * @param callback that is to be called upon creation of the user
   */
  create(
    alias: string,
    password: string,
    callback: GunCallbackUserCreate
  ): IGunInstanceRoot;

  /** Authenticates a user, previously created via User.create
   * @param pair Object containing the key pair of the user
   * @param callback that is to be called upon authentication of the user
   * @param options Options for authentication
   */
  auth(
    pair: ISEAPair,
    callback?: GunCallbackUserAuth,
    options?: OptionsUserAuth
  ): IGunInstanceRoot;
  /** Authenticates a user, previously created via User.create
   * @param alias Username or Alias which can be used to find a user
   * @param password Passphrase for the user
   * @param callback that is to be called upon authentication of the user
   * @param options Options for authentication
   */
  auth(
    alias: string,
    password: string,
    callback?: GunCallbackUserAuth,
    options?: OptionsUserAuth
  ): IGunInstanceRoot;

  /** To check if you are currently logged in */
  is?: {
    alias: string | ISEAPair;
    /** public key for encryption */
    epub: string;
    /** public key */
    pub: string;
  };

  /** Log out currently authenticated user
   * @returns A reference to the gun root chain
   */
  leave(): IGunInstanceRoot;

  /**
   * Saves a users credentials in sessionStorage of the browser.
   * As long as the tab of your app is not closed the user stays
   * logged in, even through page refreshes and reloads */
  recall(
    options: OptionsUserRecall,
    callback?: GunCallbackUserAuth
  ): IGunUserInstance;
}
