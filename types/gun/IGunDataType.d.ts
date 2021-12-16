export type IGunDataType = {
    [P in string]: IGunDataType | string | number | boolean | null
}&
{
    [T in number]: IGunDataType | string | number | boolean | null
}

export type IGunNodeDataType = IGunDataType | string | number | boolean | null
