"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const bt = require("@babel/types");
const types_1 = require("@typeconvert/types");
const unionTypes_1 = require("./unionTypes");
const getTypeParameters_1 = require("./getTypeParameters");
const Waitable_1 = require("../utils/Waitable");
const intersectTypes_1 = require("./intersectTypes");
function rawType(type) {
    return {
        kind: types_1.TypeReferenceKind.RawType,
        loc: type.loc,
        type
    };
}
/**
 * Convert a bable type into our internal `TypeReference`
 * representation.
 */
function getTypeOfBabelTypeUncached(babelType, ctx) {
    const loc = babelType.loc && new types_1.SourceLocation(babelType.loc);
    switch (babelType.type) {
        case 'AnyTypeAnnotation':
            return rawType({ kind: types_1.TypeKind.Any, loc });
        case 'BooleanLiteralTypeAnnotation':
            if (typeof babelType.value !== 'boolean') {
                throw ctx.getError('Expected boolean literal to have boolean value', babelType);
            }
            return rawType({
                kind: types_1.TypeKind.BooleanLiteral,
                value: babelType.value,
                loc
            });
        case 'BooleanTypeAnnotation':
            return rawType({ kind: types_1.TypeKind.Boolean, loc });
        case 'FunctionTypeAnnotation':
            return rawType({
                kind: types_1.TypeKind.Function,
                params: babelType.params.map(param => {
                    return {
                        name: param.name ? param.name.name : undefined,
                        type: ctx.getTypeOfBabelType(param.typeAnnotation),
                        optional: param.optional || false
                    };
                }),
                typeParameters: getTypeParameters_1.default(babelType.typeParameters, ctx),
                restParam: babelType.rest ? {
                    name: babelType.rest.name ? babelType.rest.name.name : undefined,
                    type: ctx.getTypeOfBabelType(babelType.rest.typeAnnotation),
                    optional: false
                } : undefined,
                returnType: ctx.getTypeOfBabelType(babelType.returnType),
                loc
            });
        case 'GenericTypeAnnotation':
            {
                if (babelType.typeParameters) {
                    const reference = ctx.programContext.getTypeFromIdentifier(babelType.id, ctx.scope);
                    return rawType({
                        kind: types_1.TypeKind.GenericApplication,
                        type: reference,
                        params: babelType.typeParameters.params.map(p => ctx.getTypeOfBabelType(p)),
                        loc
                    });
                }
                return Waitable_1.default.resolve(ctx.programContext.getTypeFromIdentifier(babelType.id, ctx.scope));
            }
        case 'IntersectionTypeAnnotation':
            return intersectTypes_1.default(loc, ctx, ...babelType.types.map(bt => ctx.getTypeOfBabelType(bt)));
        case 'NullableTypeAnnotation':
            {
                return unionTypes_1.default(loc, ctx, rawType({ kind: types_1.TypeKind.Null, loc }), rawType({ kind: types_1.TypeKind.Void, loc }), ctx.getTypeOfBabelType(babelType.typeAnnotation));
            }
        case 'NullLiteralTypeAnnotation':
            return rawType({ kind: types_1.TypeKind.Null, loc });
        case 'TSNumberKeyword':
        case 'NumberTypeAnnotation':
            return rawType({ kind: types_1.TypeKind.Number, loc });
        case 'ObjectTypeAnnotation':
            if (babelType.indexers && babelType.indexers.length) {
                throw ctx.assertNever('indexers and call properties are not supported', babelType);
            }
            const properties = [];
            for (let prop of babelType.properties) {
                if (prop.type === 'ObjectTypeSpreadProperty') {
                    const typeRef = ctx.getTypeOfBabelType(prop.argument).getValue();
                    ctx.assertNever('Object spread property', typeRef);
                } else {
                    if (prop.kind !== 'init') {
                        throw ctx.getError(`Invalid property kind ${prop.kind}`, prop);
                    }
                    const name = bt.isStringLiteral(prop.key) ? prop.key.value : bt.isIdentifier(prop.key) ? prop.key.name : ctx.assertNever('Unsupported property type', prop.key);
                    properties.push({
                        name,
                        optional: prop.optional || false,
                        type: ctx.getTypeOfBabelType(prop.value),
                        variance: prop.variance && prop.variance.kind === 'minus' ? types_1.Variance.contravariant : prop.variance && prop.variance.kind === 'plus' ? types_1.Variance.covariant : types_1.Variance.invariant,
                        loc
                    });
                }
            }
            const callProperties = [];
            for (const prop of babelType.callProperties || []) {
                const typeRef = ctx.getTypeOfBabelType(prop.value).getValue();
                if (typeRef.kind !== types_1.TypeReferenceKind.RawType) {
                    throw ctx.getError(`Expected raw function type but got ${typeRef.kind}.`, prop);
                }
                const type = Waitable_1.default.resolve(typeRef.type);
                if (type.kind !== types_1.TypeKind.Function) {
                    throw ctx.getError(`Expected function type but got ${type.kind}.`, prop);
                }
                callProperties.push(type);
            }
            return rawType({
                kind: types_1.TypeKind.Object,
                exact: babelType.exact || false,
                properties,
                callProperties,
                loc
            });
        case 'StringLiteralTypeAnnotation':
            if (babelType.value == null) {
                throw ctx.getError('Missing value for string literal type annotation', babelType);
            }
            return rawType({
                kind: types_1.TypeKind.StringLiteral,
                value: babelType.value,
                loc
            });
        case 'StringTypeAnnotation':
            return rawType({ kind: types_1.TypeKind.String, loc });
        case 'TupleTypeAnnotation':
            return rawType({
                kind: types_1.TypeKind.Tuple,
                types: babelType.types.map(bt => ctx.getTypeOfBabelType(bt)),
                loc
            });
        case 'TypeofTypeAnnotation':
            // TODO: this feels very wrong
            return Waitable_1.default.resolve(ctx.getTypeOfBabelType(babelType.argument));
        case 'UnionTypeAnnotation':
            return unionTypes_1.default(loc, ctx, ...babelType.types.map(bt => ctx.getTypeOfBabelType(bt)));
        case 'TSVoidKeyword':
        case 'VoidTypeAnnotation':
            return rawType({ kind: types_1.TypeKind.Void, loc });
        default:
            return ctx.assertNever('Unsupported bable type', babelType);
    }
}
exports.default = getTypeOfBabelTypeUncached;
//# sourceMappingURL=getTypeOfBabelTypeUncached.js.map