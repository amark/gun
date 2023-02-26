var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { fromObjects, toObjects } from './asyncSerialize';
import { subtle } from './compat';
export function parse(text) {
    return __awaiter(this, void 0, void 0, function* () {
        // need decodeURIComponent so binary strings are transferred properly
        const deocodedText = unescape(text);
        const objects = JSON.parse(deocodedText);
        return fromObjects(serializers(true), objects);
    });
}
export function stringify(value, waitForArrayBufferView = true) {
    return __awaiter(this, void 0, void 0, function* () {
        const serialized = yield toObjects(serializers(waitForArrayBufferView), value);
        // need encodeURIComponent so binary strings are transferred properly
        const message = JSON.stringify(serialized);
        return escape(message);
    });
}
function serializers(waitForArrayBufferView) {
    return [
        ArrayBufferSerializer,
        ArrayBufferViewSerializer(waitForArrayBufferView),
        CryptoKeySerializer,
    ];
}
const ArrayBufferSerializer = {
    id: 'ArrayBuffer',
    isType: (o) => o instanceof ArrayBuffer,
    // from https://developers.google.com/web/updates/2012/06/How-to-convert-ArrayBuffer-to-and-from-String
    // modified to use Int8Array so that we can hold odd number of bytes
    toObject: (ab) => __awaiter(this, void 0, void 0, function* () {
        return String.fromCharCode.apply(null, new Int8Array(ab));
    }),
    fromObject: (data) => __awaiter(this, void 0, void 0, function* () {
        const buf = new ArrayBuffer(data.length);
        const bufView = new Int8Array(buf);
        for (let i = 0, strLen = data.length; i < strLen; i++) {
            bufView[i] = data.charCodeAt(i);
        }
        return buf;
    }),
};
function isArrayBufferViewWithPromise(obj) {
    return obj.hasOwnProperty('_promise');
}
// Normally we could just do `abv.constructor.name`, but in
// JavaScriptCore, this wont work for some weird reason.
// list from https://developer.mozilla.org/en-US/docs/Web/API/ArrayBufferView
function arrayBufferViewName(abv) {
    if (abv instanceof Int8Array) {
        return 'Int8Array';
    }
    if (abv instanceof Uint8Array) {
        return 'Uint8Array';
    }
    if (abv instanceof Uint8ClampedArray) {
        return 'Uint8ClampedArray';
    }
    if (abv instanceof Int16Array) {
        return 'Int16Array';
    }
    if (abv instanceof Uint16Array) {
        return 'Uint16Array';
    }
    if (abv instanceof Int32Array) {
        return 'Int32Array';
    }
    if (abv instanceof Uint32Array) {
        return 'Uint32Array';
    }
    if (abv instanceof Float32Array) {
        return 'Float32Array';
    }
    if (abv instanceof Float64Array) {
        return 'Float64Array';
    }
    if (abv instanceof DataView) {
        return 'DataView';
    }
    return '';
}
function ArrayBufferViewSerializer(waitForPromise) {
    return {
        id: 'ArrayBufferView',
        isType: ArrayBuffer.isView,
        toObject: (abv) => __awaiter(this, void 0, void 0, function* () {
            if (waitForPromise) {
                // wait for promise to resolve if the abv was returned from getRandomValues
                if (isArrayBufferViewWithPromise(abv)) {
                    yield abv._promise;
                }
            }
            return {
                name: arrayBufferViewName(abv),
                buffer: abv.buffer,
            };
        }),
        fromObject: (abvs) => __awaiter(this, void 0, void 0, function* () {
            // tslint:disable-next-line
            return eval(`new ${abvs.name}(abvs.buffer)`);
        }),
    };
}
function hasData(ck) {
    return ck._import !== undefined;
}
const CryptoKeySerializer = {
    id: 'CryptoKey',
    isType: (o) => {
        const localStr = o.toLocaleString();
        // can't use CryptoKey or constructor on WebView iOS
        const isCryptoKey = localStr === '[object CryptoKey]' || localStr === '[object Key]';
        const isCryptoKeyWithData = o._import && !o.serialized;
        return isCryptoKey || isCryptoKeyWithData;
    },
    toObject: (ck) => __awaiter(this, void 0, void 0, function* () {
        // if we already have the import serialized, just return that
        if (hasData(ck)) {
            return {
                serialized: true,
                _import: ck._import,
                type: ck.type,
                extractable: ck.extractable,
                algorithm: ck.algorithm,
                usages: ck.usages,
            };
        }
        const jwk = yield subtle().exportKey('jwk', ck);
        return {
            _import: {
                format: 'jwk',
                keyData: jwk,
            },
            serialized: true,
            algorithm: ck.algorithm,
            extractable: ck.extractable,
            usages: ck.usages,
            type: ck.type,
        };
    }),
    fromObject: (cks) => __awaiter(this, void 0, void 0, function* () {
        // if we don't have access to to a real crypto implementation, just return
        // the serialized crypto key
        if (crypto.fake) {
            const newCks = Object.assign({}, cks);
            delete newCks.serialized;
            return newCks;
        }
        return subtle().importKey(cks._import.format, cks._import.keyData, cks.algorithm, cks.extractable, cks.usages);
    }),
};
//# sourceMappingURL=serializeBinary.js.map