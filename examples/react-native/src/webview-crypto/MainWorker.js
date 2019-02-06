import serializeError from 'serialize-error';
import { parse, stringify } from './serializeBinary';
const SUBTLE_METHODS = [
    'encrypt',
    'decrypt',
    'sign',
    'verify',
    'digest',
    'generateKey',
    'deriveKey',
    'deriveBits',
    'importKey',
    'exportKey',
    'wrapKey',
    'unwrapKey',
];
/*
MainWorker provides a `crypto` attribute that proxies method calls
to the webview.

It sends strings to the webview in the format:

    {
      id: <id>,
      method: getRandomValues | subtle.<method name>,
      args: [<serialized arg>]
    }

When the webview succeeds in completeing that method, it gets backs:

    {
      id: <id>,
      value: <serialized return value>
    }

And when it fails:

    {
      id: <id>,
      reason: <serialized rejected reason>,
    }

*/
export default class MainWorker {
    // sendToWebView should take a string and send that message to the webview
    constructor(sendToWebView, debug = false) {
        this.sendToWebView = sendToWebView;
        this.debug = debug;
        // hold a queue of messages to send, in case someone calls crypto
        // before the webview is initialized
        this.toSend = [];
        this.readyToSend = false;
        // Holds the `resolve` and `reject` function for all the promises
        // we are working on
        this.messages = {};
    }
    get crypto() {
        const callMethod = this.callMethod;
        return {
            subtle: this.subtle,
            getRandomValues: this.getRandomValues.bind(this),
            fake: true,
        };
    }
    get subtle() {
        const s = {};
        for (const m of SUBTLE_METHODS) {
            s[m] = (...args) => {
                return this.callMethod(`subtle.${m}`, args, true);
            };
        }
        return s;
    }
    // http://stackoverflow.com/a/105074/907060
    static uuid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return `${s4()}-${s4()}-${s4()}-${s4()}-${s4()}-${s4()}-${s4()}-${s4()}`;
    }
    onWebViewMessage(message) {
        // first message just tells us the webview is ready
        if (!this.readyToSend) {
            if (this.debug) {
                console.log('[webview-crypto] Got first message; ready to send');
            }
            this.readyToSend = true;
            for (const m of this.toSend) {
                this.sendToWebView(m);
            }
            return;
        }
        parse(message)
            .then(({ id, value, reason }) => {
            if (this.debug) {
                console.log('[webview-crypto] Received message:', JSON.stringify({
                    id,
                    value,
                    reason,
                }));
            }
            if (!id) {
                console.warn('[webview-crypto] no ID passed back from message:', JSON.stringify(serializeError(reason)));
                return;
            }
            const { resolve, reject } = this.messages[id];
            if (value) {
                resolve(value);
            }
            else {
                reject(reason);
            }
            delete this.messages[id];
        })
            .catch((reason) => {
            console.warn('[webview-crypto] error in `parse` of message:', JSON.stringify(message), 'reason:', JSON.stringify(serializeError(reason)));
        });
    }
    getRandomValues(array) {
        const promise = this.callMethod('getRandomValues', [array], false);
        // make the _promise not enumerable so it isn't JSON stringified,
        // which could lead to an infinite loop with Angular's zone promises
        Object.defineProperty(array, '_promise', {
            value: promise,
            configurable: true,
            enumerable: false,
            writable: true,
        });
        promise.then((updatedArray) => {
            array.set(updatedArray);
        });
        return array;
    }
    callMethod(method, args, waitForArrayBufferView) {
        const id = MainWorker.uuid();
        // store this promise, so we can resolve it when we get a message
        // back from the web view
        const promise = new Promise((resolve, reject) => {
            this.messages[id] = { resolve, reject };
        });
        const payloadObject = { method, id, args };
        if (this.debug) {
            console.log('[webview-crypto] Sending message:', JSON.stringify({
                method,
                args,
                payloadObject,
            }));
        }
        stringify(payloadObject, waitForArrayBufferView)
            .then((message) => {
            if (this.readyToSend) {
                this.sendToWebView(message);
            }
            else {
                this.toSend.push(message);
            }
        })
            .catch((reason) => {
            this.messages[id].reject({
                message: `exception in stringify-ing message: ${method} ${id}`,
                reason,
            });
            delete this.messages[id];
        });
        return promise;
    }
}
//# sourceMappingURL=MainWorker.js.map