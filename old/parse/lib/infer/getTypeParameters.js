"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const bt = require("@babel/types");
const types_1 = require("@typeconvert/types");
function getTypeParameters(typeParameters, ctx) {
    if (!typeParameters || bt.isNoop(typeParameters)) {
        return [];
    }
    if (bt.isTypeParameterDeclaration(typeParameters)) {
        return typeParameters.params.map(p => {
            if (!p.name) {
                throw ctx.getError('Cannot have a type parameter without a name', p);
            }
            if (p.bound) {
                throw ctx.getError('Bound type parameters not supported yet', p);
            }
            return {
                name: p.name,
                variance: p.variance && p.variance.kind === 'plus' ? types_1.Variance.covariant : p.variance && p.variance.kind === 'minus' ? types_1.Variance.contravariant : types_1.Variance.invariant
            };
        });
    }
    // TSTypeParameterDeclaration
    return typeParameters.params.map(p => {
        if (!p.name) {
            throw ctx.getError('Cannot have a type parameter without a name', p);
        }
        return {
            name: p.name,
            variance: types_1.Variance.invariant
        };
    });
}
exports.default = getTypeParameters;
//# sourceMappingURL=getTypeParameters.js.map