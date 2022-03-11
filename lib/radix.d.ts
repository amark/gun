import {} from './radix'
declare module './radix' {
  export const Radix: IRadix;
  export interface IRadix {}
}

declare global {
  interface Window {
    Radix: IRadix;
  }
}
