import {
  GunCallbackUserAuth,
  GunCallbackUserCreate,
  OptionsUserAuth,
  ISEAPair,
  OptionsUserRecall,
  IGunInstanceRoot,
  GunSchema,
} from '..';
import { IGunInstanceRoot2TGunInstance } from '../utils';

export interface IGunUserInstance<
  UNode extends Record<string, GunSchema> = any,
  UNodeInstance extends IGunUserInstance<
    UNode,
    UNodeInstance,
    TNode,
    TNodeInstanceRoot
  > = any,
  TNode extends Record<string, GunSchema> = any,
  TNodeInstanceRoot extends IGunInstanceRoot<TNode, any> = any
> extends IGunInstanceRoot<UNode, UNodeInstance> {
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
  ): UNodeInstance;

  /** Authenticates a user, previously created via User.create
   * @param pair Object containing the key pair of the user
   * @param callback that is to be called upon authentication of the user
   * @param options Options for authentication
   */
  auth(
    pair: ISEAPair,
    callback?: GunCallbackUserAuth,
    options?: OptionsUserAuth
  ): UNodeInstance;
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
  ): UNodeInstance;

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
  leave(): IGunInstanceRoot2TGunInstance<TNodeInstanceRoot>;

  /**
   * Saves a users credentials in sessionStorage of the browser.
   * As long as the tab of your app is not closed the user stays
   * logged in, even through page refreshes and reloads */
  recall(
    options: OptionsUserRecall,
    callback?: GunCallbackUserAuth
  ): UNodeInstance;
}
