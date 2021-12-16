export interface ISEACertifyOptions{
    blacklist?: string | {
        read: string|{'#': string}
        write: string|{'#': string}
    }
    expiry?: number 
}