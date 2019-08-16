"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("../utils/Waitable");
const resolveTypeReference_1 = require("./resolveTypeReference");
const isSubType_1 = require("./isSubType");
function intersectTypes(loc, ctx, ...typeReferences) {
    const resultingTypes = [];
    const types = typeReferences.map(tr => resolveTypeReference_1.default(tr));
    typeReferences.forEach((typeReference, i) => {
        const type = types[i];
        const isRedundant = types.some((otherType, ix) => {
            if (ix === i) return false;
            return (
                // if the other type is assignable to this type, it is redundant
                isSubType_1.default(otherType, type, ctx) && (
                // providing it's not the same as the other type
                // if it is the same as the other type, just keep the first instance
                i > ix || !isSubType_1.default(type, otherType, ctx))
            );
        });
        if (!isRedundant) {
            resultingTypes.push(typeReference);
        }
    });
    if (resultingTypes.length === 1) {
        return Waitable_1.default.resolve(resultingTypes[0]);
    }
    const intersection = {
        kind: types_1.TypeKind.Intersection,
        types: resultingTypes,
        loc
    };
    return {
        kind: types_1.TypeReferenceKind.RawType,
        type: intersection,
        loc
    };
}
exports.default = intersectTypes;
//# sourceMappingURL=intersectTypes.js.map