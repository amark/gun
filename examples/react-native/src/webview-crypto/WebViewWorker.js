var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import serializeError from 'serialize-error';
import { subtle } from './compat';
import { parse, stringify } from './serializeBinary';
export class WebViewWorker {
    constructor(sendToMain) {
        this.sendToMain = sendToMain;
        sendToMain('We are ready!');
    }
    onMainMessage(message) {
        return __awaiter(this, void 0, void 0, function* () {
            let id;
            let method;
            let args;
            try {
                ({ id, method, args } = yield parse(message));
            }
            catch (e) {
                yield this.send({
                    reason: `Couldn't parse data: ${e}`,
                });
                return;
            }
            let value;
            try {
                if (method === 'getRandomValues') {
                    value = crypto.getRandomValues(args[0]);
                }
                else {
                    const methodName = method.split('.')[1];
                    console.log(methodName, args);
                    value = yield subtle()[methodName].apply(subtle(), args);
                    // if we import a crypto key, we want to save how we imported it
                    // so we can send that back and re-create the key later
                    if (methodName === 'importKey') {
                        value._import = {
                            format: args[0],
                            keyData: args[1],
                        };
                    }
                }
            }
            catch (e) {
                yield this.send({ id, reason: serializeError(e) });
                return;
            }
            yield this.send({ id, value });
        });
    }
    send(data) {
        return __awaiter(this, void 0, void 0, function* () {
            let message;
            try {
                message = yield stringify(data);
            }
            catch (e) {
                const newData = {
                    id: data.id,
                    reason: `stringify error ${e}`,
                };
                this.sendToMain(JSON.stringify(newData));
                return;
            }
            this.sendToMain(message);
        });
    }
}
//# sourceMappingURL=WebViewWorker.js.map