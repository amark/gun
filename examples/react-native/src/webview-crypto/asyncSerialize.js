var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// tslint:disable
import find from 'lodash/find';
class Serialized {
}
function isSerialized(object) {
    return object.hasOwnProperty('__serializer_id');
}
export function toObjects(serializers, o) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof o !== 'object') {
            return o;
        }
        const serializer = find(serializers, (s) => s.isType(o));
        if (serializer) {
            const value = serializer.toObject ? yield serializer.toObject(o) : o;
            return {
                __serializer_id: serializer.id,
                value: yield toObjects(serializers, value),
            };
        }
        const newO = o instanceof Array ? [] : {};
        for (const atr in o) {
            newO[atr] = yield toObjects(serializers, o[atr]);
        }
        return newO;
    });
}
export function fromObjects(serializers, o) {
    return __awaiter(this, void 0, void 0, function* () {
        if (typeof o !== 'object') {
            return o;
        }
        if (isSerialized(o)) {
            const value = yield fromObjects(serializers, o.value);
            const serializer = find(serializers, ['id', o.__serializer_id]) || {};
            if (serializer.fromObject) {
                return serializer.fromObject(value);
            }
            return value;
        }
        const newO = o instanceof Array ? [] : {};
        for (const atr in o) {
            newO[atr] = yield fromObjects(serializers, o[atr]);
        }
        return newO;
    });
}
//# sourceMappingURL=asyncSerialize.js.map