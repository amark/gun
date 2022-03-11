import {} from './rindexed'
declare module './rindexed' {
  export const Store: IRindexedDB;
  export interface IRindexedDB {
    indexedDB: IRindexedDB;
    window: Window;
  }
}

declare global {
  interface Window {
    RindexedDB: IRindexedDB;
  }
}
