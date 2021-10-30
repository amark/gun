import { ISEAPair } from "../sea/ISEAPair";

export type AuthCallback = (ack: {
    ack: 2;
    ing: false,
    id: number,
    get: string;
    on: (tag:unknown , args:unknown, as: unknown) => unknown;
    put: {
        alias: string;
        auth: string;
        epub: string;
        pub: string;
    };
    sea: ISEAPair;
    err?: undefined;
    soul: string;
} | {
    err: string;
}) => void