import { IGunChainReference } from './chain';
export declare type ArrayOf<T> = T extends Array<infer U> ? U : never;
/** Gun does not accept Array value, so we need extract to make types correct */
export declare type AllowArray<T> = ArrayOf<T> extends never ? T : ArrayOf<T>;
export declare type DisallowArray<T> = ArrayOf<T> extends never ? T : never;
/** These types cannot be stored on Gun */
export declare type AlwaysDisallowedType<T> = T extends (...args: any[]) => void ? never : T extends {
    new (...args: any[]): any;
} ? never : AccessObject<T>;
export declare type AccessObject<T> = T extends object ? {
    [key in keyof T]: (AlwaysDisallowedType<T[key]> extends never ? never : AccessObject<T[key]>);
} : T;
/** These types cannot be stored on Gun's root level */
export declare type DisallowPrimitives<Open, T> = Open extends false ? T : T extends string ? never : T extends number ? never : T extends boolean ? never : T extends null ? never : T extends undefined ? never : T;
export declare type ArrayAsRecord<DataType> = ArrayOf<DataType> extends never ? DataType : Record<string, any>;
export declare type Saveable<DataType> = Partial<DataType> | string | number | boolean | null | IGunChainReference<DataType>;
export declare type AckCallback = (ack: {
    err: Error;
    ok: any;
} | {
    err: undefined;
    ok: string;
}) => void;
export declare type IGunCryptoKeyPair = Record<'pub' | 'priv' | 'epub' | 'epriv', string>;
export interface IGunRecordNodeRawBase {
    '#': string;
}
export interface IGunRecordNodeRawExtra<DataType> extends IGunRecordNodeRawBase {
    '>': Record<keyof DataType, number>;
}
export interface IGunRecordNodeRaw<DataType> {
    '_': IGunRecordNodeRawExtra<DataType>;
}
export declare type IGunRecordNode<DataType> = {
    [K in keyof DataType]: IGunRecordNodeRawBase;
} & IGunRecordNodeRaw<DataType>;
export declare type IGunRecordData<DataType> = DataType & IGunRecordNodeRaw<DataType>;
