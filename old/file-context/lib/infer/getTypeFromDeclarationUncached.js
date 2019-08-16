"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("../utils/Waitable");
function getTypeFromDeclarationUncached(declaration, ctx) {
    switch (declaration.kind) {
        case types_1.DeclarationKind.FunctionDeclaration:
        case types_1.DeclarationKind.VariableDeclaration:
            return null;
        case types_1.DeclarationKind.TypeAlias:
            {
                const typeParameters = Waitable_1.default.resolve(declaration.typeParameters);
                // TODO: should we always just return a raw reference?
                return {
                    kind: types_1.TypeReferenceKind.LocalVariable,
                    type: typeParameters.length ? {
                        kind: types_1.TypeReferenceKind.RawType,
                        type: {
                            kind: types_1.TypeKind.Generic,
                            type: declaration.right,
                            typeParameters: typeParameters,
                            loc: declaration.loc
                        },
                        loc: Waitable_1.default.resolve(declaration.right).loc
                    } : declaration.right,
                    name: declaration.localName,
                    filename: ctx.filename,
                    loc: declaration.loc
                };
            }
        default:
            return ctx.assertNever('Unsupported declaration kind ' + declaration.kind, declaration);
    }
}
exports.default = getTypeFromDeclarationUncached;
//# sourceMappingURL=getTypeFromDeclarationUncached.js.map