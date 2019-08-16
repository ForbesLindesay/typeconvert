"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("../utils/Waitable");
const TypeParameterAssignments_1 = require("./TypeParameterAssignments");
function resolveTypeReference(typeReference, assignments) {
    const tr = Waitable_1.default.resolve(typeReference);
    switch (tr.kind) {
        case types_1.TypeReferenceKind.LocalVariable:
        case types_1.TypeReferenceKind.ModuleExport:
            return resolveTypeReference(tr.type, TypeParameterAssignments_1.RootTypeParameterAssignments);
        case types_1.TypeReferenceKind.RawType:
            return { type: Waitable_1.default.resolve(tr.type), assignments };
    }
}
exports.default = resolveTypeReference;
//# sourceMappingURL=resolveTypeReference.js.map