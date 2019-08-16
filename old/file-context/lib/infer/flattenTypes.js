"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("../utils/Waitable");
function flattenTypes(types, kind) {
    const result = [];
    for (const typeM of types) {
        const type = Waitable_1.default.resolve(typeM);
        if (type.kind === types_1.TypeReferenceKind.RawType) {
            const t = Waitable_1.default.resolve(type.type);
            if (t.kind === kind) {
                result.push(...flattenTypes(Waitable_1.default.resolve(t.types), kind));
            }
        }
        result.push(type);
    }
    return result;
}
exports.default = flattenTypes;
//# sourceMappingURL=flattenTypes.js.map