export type CreateCallback = (ack: {
    ok: 0;
    pub: string;
    err?:undefined
} | {
    ok?: 0;
    pub?: string;
    err: string;
}) => any