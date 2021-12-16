export type IGunConstructorOptions = Partial<{

    /** Undocumented but mentioned. Write data to a JSON. */
    file: string;

    /** Undocumented but mentioned. Create a websocket server */
    web: any;

    /** Undocumented but mentioned. Amazon S3 */
    s3: {
        key: any;
        secret: any;
        bucket: any;
    };

    /** the URLs are properties, and the value is an empty object. */
    peers: string[] | Record<string, {}>;

    /** default: true, creates and persists local (nodejs) data using Radisk. */
    radisk: boolean;

    /** default: true, persists local (browser) data to localStorage. */
    localStorage: boolean;

    /** uuid allows you to override the default 24 random alphanumeric soul generator with your own function. */
    uuid(): string | number;

    /**
     * allows you to pass options to a 3rd party module. Their project README will likely list the exposed options
     * @see https://github.com/amark/gun/wiki/Modules
     */
    [key: string]: any;
}> | string | string[];