export type IGunDataType = {
    [P in string]: IGunDataType | string | number | boolean | null | undefined
}&
{
    [T in number]: IGunDataType | string | number | boolean | null | undefined
}

export type IGunNodeDataType = IGunDataType | string | number | boolean | null | undefined
