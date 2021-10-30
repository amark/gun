export declare type IGunReturnObject<TObject, TSoul> = (TObject & {
    _:{
        '#': TSoul,
        '>': TObject extends number |string|boolean?unknown : Record<keyof TObject, number>
    }
})|undefined