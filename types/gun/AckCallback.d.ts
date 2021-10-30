export declare type AckCallback = (ack: {
    err: string;
    ok: undefined;
} | {
    err: undefined;
    ok: string;
}) => void;