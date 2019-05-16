export declare class WebViewWorker {
    private sendToMain;
    constructor(sendToMain: (message: string) => void);
    onMainMessage(message: string): Promise<void>;
    send(data: any): Promise<void>;
}
