export declare function parse(text: string): Promise<any>;
export declare function stringify(value: any, waitForArrayBufferView?: boolean): Promise<string>;
export interface IArrayBufferViewWithPromise extends ArrayBufferView {
    _promise?: Promise<ArrayBufferView>;
}
