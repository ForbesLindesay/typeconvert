"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
function getTypeOfDeclarationValueUncached(declaration, ctx) {
    switch (declaration.kind) {
        case types_1.DeclarationKind.FunctionDeclaration:
            return {
                kind: types_1.TypeKind.Function,
                params: declaration.params,
                restParam: declaration.restParam,
                returnType: declaration.returnType,
                typeParameters: declaration.typeParameters,
                loc: declaration.loc
            };
        case types_1.DeclarationKind.ImportDefault:
            {
                const dep = ctx.programContext.parse(declaration.filename);
                const statements = dep.outputExportStatements.filter(s => s.kind === types_1.ExportKind.Default);
                if (statements.length === 0) {
                    throw ctx.getError(`Could not find default export in "${dep.filename}"`, declaration);
                }
                if (statements.length > 1) {
                    throw ctx.getError(`Found multiple default exports in "${dep.filename}"`, declaration);
                }
                const t = dep.getResolvedTypeOfIdentifierValue({
                    kind: types_1.TypeKind.TypeOf,
                    name: statements[0].localName,
                    filename: declaration.filename,
                    loc: null
                });
                if (!t) {
                    throw ctx.getError(`Could not resolve type of default export for "${dep.filename}"`, declaration);
                }
                return t;
            }
        default:
            return ctx.assertNever('Unsupported type ' + declaration.kind, declaration);
    }
}
exports.default = getTypeOfDeclarationValueUncached;
//# sourceMappingURL=getTypeOfDeclarationValueUncached.js.map