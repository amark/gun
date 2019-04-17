export interface ISerializer<T, S> {
    id: string;
    isType: (o: any) => boolean;
    toObject?: (t: T) => Promise<S>;
    fromObject?: (o: S) => Promise<T>;
}
export declare function toObjects(serializers: Array<ISerializer<any, any>>, o: any): Promise<any>;
export declare function fromObjects(serializers: Array<ISerializer<any, any>>, o: any): Promise<any>;
