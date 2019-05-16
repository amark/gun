export default class MainWorker {
    private sendToWebView;
    private debug;
    readonly crypto: Crypto;
    private readonly subtle;
    private static uuid;
    private toSend;
    private readyToSend;
    private messages;
    constructor(sendToWebView: (message: string) => void, debug?: boolean);
    onWebViewMessage(message: string): void;
    private getRandomValues;
    private callMethod;
}
