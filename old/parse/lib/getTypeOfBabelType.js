"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const mergeTypes_1 = require("./mergeTypes");
const getTypeParameters_1 = require("./getTypeParameters");
function _getTypeOfBabelType(babelType, ctx) {
    const loc = babelType.loc && new types_1.SourceLocation(babelType.loc);
    switch (babelType.type) {
        case 'AnyTypeAnnotation':
            return { kind: types_1.TypeKind.Any, loc };
        case 'BooleanTypeAnnotation':
            return { kind: types_1.TypeKind.Boolean, loc };
        case 'FunctionTypeAnnotation':
            return {
                kind: types_1.TypeKind.Function,
                params: babelType.params.map(param => {
                    return {
                        name: param.name ? param.name.name : undefined,
                        type: getTypeOfBabelType(param.typeAnnotation, ctx),
                        optional: param.optional || false
                    };
                }),
                typeParameters: getTypeParameters_1.default(babelType.typeParameters, ctx),
                restParam: babelType.rest ? {
                    name: babelType.rest.name ? babelType.rest.name.name : undefined,
                    type: getTypeOfBabelType(babelType.rest.typeAnnotation, ctx),
                    optional: false
                } : undefined,
                returnType: getTypeOfBabelType(babelType.returnType, ctx),
                loc
            };
        case 'GenericTypeAnnotation':
            {
                ctx.useIdentifierInExport(babelType.id.name);
                const reference = ctx.getTypeFromIdentifier(babelType.id);
                if (babelType.typeParameters) {
                    return {
                        kind: types_1.TypeKind.GenericApplication,
                        type: reference,
                        params: babelType.typeParameters.params.map(p => getTypeOfBabelType(p, ctx)),
                        loc
                    };
                }
                return reference;
            }
        case 'IntersectionTypeAnnotation':
            return {
                kind: types_1.TypeKind.Intersection,
                types: babelType.types.map(bt => getTypeOfBabelType(bt, ctx)),
                loc
            };
        case 'NullableTypeAnnotation':
            {
                return mergeTypes_1.default(loc, { kind: types_1.TypeKind.Null, loc }, { kind: types_1.TypeKind.Void, loc }, getTypeOfBabelType(babelType.typeAnnotation, ctx));
            }
        case 'NullLiteralTypeAnnotation':
            return { kind: types_1.TypeKind.Null, loc };
        case 'TSNumberKeyword':
        case 'NumberTypeAnnotation':
            return { kind: types_1.TypeKind.Number, loc };
        case 'ObjectTypeAnnotation':
            if (babelType.indexers && babelType.indexers.length || babelType.callProperties && babelType.callProperties.length) {
                return babelType;
            }
            const properties = [];
            for (let prop of babelType.properties) {
                if (prop.type === 'ObjectTypeSpreadProperty') {
                    babelType;
                } else {
                    properties.push({
                        name: prop.key.name,
                        optional: prop.optional || false,
                        type: getTypeOfBabelType(prop.value, ctx),
                        variance: prop.variance && prop.variance.kind === 'minus' ? types_1.Variance.contravariant : prop.variance && prop.variance.kind === 'plus' ? types_1.Variance.covariant : types_1.Variance.invariant,
                        loc
                    });
                }
            }
            return {
                kind: types_1.TypeKind.Object,
                exact: babelType.exact || false,
                properties,
                loc
            };
        case 'StringLiteralTypeAnnotation':
            if (babelType.value == null) {
                throw ctx.getError('Missing value for string literal type annotation', babelType);
            }
            return { kind: types_1.TypeKind.StringLiteral, value: babelType.value, loc };
        case 'StringTypeAnnotation':
            return { kind: types_1.TypeKind.String, loc };
        case 'TupleTypeAnnotation':
            return {
                kind: types_1.TypeKind.Tuple,
                types: babelType.types.map(bt => getTypeOfBabelType(bt, ctx)),
                loc
            };
        case 'TypeofTypeAnnotation':
            return getTypeOfBabelType(babelType.argument, ctx);
        case 'UnionTypeAnnotation':
            return mergeTypes_1.default(loc, ...babelType.types.map(bt => getTypeOfBabelType(bt, ctx)));
        case 'VoidTypeAnnotation':
            return { kind: types_1.TypeKind.Void, loc };
        default:
            return babelType;
    }
}
function getTypeOfBabelType(babelType, ctx) {
    const result = _getTypeOfBabelType(babelType, ctx);
    if (result === babelType) {
        throw ctx.getError('Unsupported type ' + babelType.type, babelType);
    }
    return result;
}
exports.default = getTypeOfBabelType;
//# sourceMappingURL=getTypeOfBabelType.js.map