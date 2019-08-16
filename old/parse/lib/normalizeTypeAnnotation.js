"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bt = require("@babel/types");
const TypeAnnotationKind_1 = require("./types/TypeAnnotationKind");
const ExpressionKind_1 = require("./types/ExpressionKind");
const Variance_1 = require("./types/Variance");
const ObjectTypeAnnotation_1 = require("./types/TypeAnnotationTypes/ObjectTypeAnnotation");
function normalizeTypeAnnotation(typeAnnotation, ctx) {
    if (!typeAnnotation || bt.isNoop(typeAnnotation)) {
        return undefined;
    }
    return normalizeType(typeAnnotation.typeAnnotation, ctx);
}
exports.default = normalizeTypeAnnotation;
function normalizeType(ta, ctx) {
    if (!ta || bt.isNoop(ta)) {
        return undefined;
    }
    switch (ta.type) {
        case 'AnyTypeAnnotation':
        case 'TSAnyKeyword':
            return { kind: TypeAnnotationKind_1.default.AnyTypeAnnotation, loc: ta.loc };
        case 'ArrayTypeAnnotation':
        case 'TSArrayType': {
            return {
                kind: TypeAnnotationKind_1.default.ArrayTypeAnnotation,
                elementType: normalizeType(ta.elementType, ctx),
                loc: ta.loc,
            };
        }
        case 'BooleanTypeAnnotation':
        case 'TSBooleanKeyword':
            return { kind: TypeAnnotationKind_1.default.BooleanTypeAnnotation, loc: ta.loc };
        case 'BooleanLiteralTypeAnnotation':
        case 'NumberLiteralTypeAnnotation':
        case 'StringLiteralTypeAnnotation':
            return {
                kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                value: ta.value,
                loc: ta.loc,
            };
        case 'TSLiteralType':
            return {
                kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                value: ta.literal.value,
                loc: ta.loc,
            };
        case 'NullLiteralTypeAnnotation':
        case 'TSNullKeyword':
            return {
                kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                value: null,
                loc: ta.loc,
            };
        case 'VoidTypeAnnotation':
        // TODO: TypeScript void and undefined have some subtle differences
        // we may want to track these at some point in the future
        case 'TSVoidKeyword':
        case 'TSUndefinedKeyword':
            return {
                kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                value: undefined,
                loc: ta.loc,
            };
        case 'ExistsTypeAnnotation':
            return { kind: TypeAnnotationKind_1.default.ExistsTypeAnnotation, loc: ta.loc };
        case 'FunctionTypeAnnotation':
            return normalizeFunctionTypeAnnotation(ta, ctx);
        case 'TSFunctionType':
            const lastParam = ta.parameters[ta.parameters.length - 1];
            let restParam = undefined;
            let params = ta.parameters;
            if (bt.isRestElement(lastParam)) {
                restParam = lastParam;
                params = ta.parameters.slice(0, ta.parameters.length - 1);
            }
            return {
                kind: TypeAnnotationKind_1.default.FunctionTypeAnnotation,
                params: params.map(p => normalizeTsFunctionTypeParam(p, ctx)),
                restParam: restParam ? normalizeTsRestParam(restParam, ctx) : undefined,
                typeParams: (ta.typeParameters ? ta.typeParameters.params : []).map(p => normalizeTypeParameter(p, ctx)),
                returnType: normalizeTypeAnnotation(ta.typeAnnotation, ctx),
                loc: ta.loc,
            };
        case 'GenericTypeAnnotation':
        case 'TSTypeReference': {
            return normalizeTypeReference(ta, ctx);
        }
        case 'IntersectionTypeAnnotation':
        case 'TSIntersectionType': {
            const types = ta.types;
            return {
                kind: TypeAnnotationKind_1.default.IntersectionTypeAnnotation,
                types: types.map(t => normalizeType(t, ctx)),
                loc: ta.loc,
            };
        }
        case 'UnionTypeAnnotation':
        case 'TSUnionType': {
            const types = ta.types;
            return {
                kind: TypeAnnotationKind_1.default.UnionTypeAnnotation,
                types: types.map(t => normalizeType(t, ctx)),
                loc: ta.loc,
            };
        }
        case 'MixedTypeAnnotation':
        case 'TSUnknownKeyword':
            return { kind: TypeAnnotationKind_1.default.UnknownTypeAnnotation, loc: ta.loc };
        case 'EmptyTypeAnnotation':
        case 'TSNeverKeyword':
            return { kind: TypeAnnotationKind_1.default.EmptyTypeAnnotation, loc: ta.loc };
        case 'NumberTypeAnnotation':
        case 'TSNumberKeyword':
            return { kind: TypeAnnotationKind_1.default.NumberTypeAnnotation, loc: ta.loc };
        case 'StringTypeAnnotation':
        case 'TSStringKeyword':
            return { kind: TypeAnnotationKind_1.default.StringTypeAnnotation, loc: ta.loc };
        case 'TupleTypeAnnotation':
            return {
                kind: TypeAnnotationKind_1.default.TupleTypeAnnotation,
                elements: ta.types.map(t => normalizeType(t, ctx)),
                restElement: undefined,
                loc: ta.loc,
            };
        case 'TSTupleType': {
            let elementTypes = ta.elementTypes;
            const lastElementType = elementTypes[elementTypes.length - 1];
            let restElement = undefined;
            if (bt.isTSRestType(lastElementType)) {
                restElement = normalizeType(lastElementType.typeAnnotation, ctx);
                elementTypes = elementTypes.slice(0, elementTypes.length - 1);
            }
            return {
                kind: TypeAnnotationKind_1.default.TupleTypeAnnotation,
                elements: elementTypes.map(t => normalizeType(t, ctx)),
                restElement,
                loc: ta.loc,
            };
        }
        case 'ThisTypeAnnotation':
        case 'TSThisType': {
            return { kind: TypeAnnotationKind_1.default.ThisTypeAnnotation, loc: ta.loc };
        }
        case 'TSInferType': {
            if (!ta.typeParameter.name) {
                throw ctx.getError(`You must specify a name to infer a type parameter`, ta.typeParameter);
            }
            return {
                kind: TypeAnnotationKind_1.default.InferTypeAnnotation,
                id: {
                    kind: ExpressionKind_1.default.Identifier,
                    name: ta.typeParameter.name,
                    loc: ta.typeParameter.loc,
                },
                loc: ta.loc,
            };
        }
        case 'NullableTypeAnnotation': {
            const baseType = normalizeType(ta.typeAnnotation, ctx);
            return {
                kind: TypeAnnotationKind_1.default.UnionTypeAnnotation,
                types: [
                    baseType,
                    {
                        kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                        value: null,
                        loc: ta.loc,
                    },
                    {
                        kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                        value: undefined,
                        loc: ta.loc,
                    },
                ],
                loc: ta.loc,
            };
        }
        case 'TSOptionalType': {
            const baseType = normalizeType(ta.typeAnnotation, ctx);
            return {
                kind: TypeAnnotationKind_1.default.UnionTypeAnnotation,
                types: [
                    baseType,
                    {
                        kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                        value: undefined,
                        loc: ta.loc,
                    },
                ],
                loc: ta.loc,
            };
        }
        case 'TSImportType': {
            return normalizeTSImportType(ta, ctx);
        }
        case 'TypeofTypeAnnotation':
            if (!bt.isGenericTypeAnnotation(ta.argument) ||
                (ta.argument.typeParameters && ta.argument.typeParameters.params.length)) {
                throw ctx.getError(`typeof can only be used to get the type of variables or properties of variables`, ta.argument);
            }
            return {
                kind: TypeAnnotationKind_1.default.TypeofTypeAnnotation,
                id: normalizeTypeidentifier(ta.argument.id, ctx),
                loc: ta.loc,
            };
        case 'TSTypeQuery':
            return {
                kind: TypeAnnotationKind_1.default.TypeofTypeAnnotation,
                id: bt.isTSImportType(ta.exprName)
                    ? normalizeTSImportType(ta.exprName, ctx)
                    : normalizeTypeidentifier(ta.exprName, ctx),
                loc: ta.loc,
            };
        case 'TSObjectKeyword':
            throw ctx.getError(`The "object" keyword is not supported. You should either use something more specific, such as \`{[key: string]: unknown}\` or the completely generic \`any\``, ta);
        case 'TSRestType':
            throw ctx.getError(`Rest types are only supported inside tuples.`, ta);
        // TODO: objects, interfaces, classes
        case 'ObjectTypeAnnotation':
            return normalizeObjectTypeAnnotation(ta, ctx);
        case 'InterfaceTypeAnnotation': {
            // const obj = normalizeObjectTypeAnnotation(ta.body, ctx);
            // return {
            //   ...obj,
            //   extends: [
            //     ...obj.extends,
            //     ...(ta.extends || []).map(e => normalizeTypeReference(e, ctx)),
            //   ],
            // };
            throw ctx.getError('InterfaceTypeAnnotation not supported here', ta);
        }
        case 'TSTypeLiteral': {
            const properties = [];
            const callProperties = [];
            ta.members.map(me => {
                switch (me.type) {
                    case 'TSPropertySignature': {
                        if (me.initializer) {
                            throw ctx.getError('initializers are not supported on type properties', me);
                        }
                        properties.push({
                            kind: ObjectTypeAnnotation_1.ObjectTypeElementKind.ObjectTypeProperty,
                            key: normalizeTsObjectKeyKey(me.key, ctx),
                            computed: !!(me.computed && !bt.isLiteral(me.key)),
                            optional: me.optional || false,
                            variance: me.readonly ? Variance_1.default.ReadOnly : Variance_1.default.ReadWrite,
                            valueType: normalizeTypeAnnotation(me.typeAnnotation, ctx),
                            mode: 'normal',
                            proto: false,
                            static: false,
                        });
                        break;
                    }
                    case 'TSCallSignatureDeclaration':
                        callProperties.push(normalizeFunctionTypeAnnotation(me, ctx));
                        break;
                    case 'TSMethodSignature': {
                        const tsFunctionType = bt.tsFunctionType(me.typeParameters, me.parameters, me.typeAnnotation);
                        tsFunctionType.loc = me.loc;
                        properties.push({
                            kind: ObjectTypeAnnotation_1.ObjectTypeElementKind.ObjectTypeProperty,
                            key: normalizeTsObjectKeyKey(me.key, ctx),
                            computed: !!(me.computed && !bt.isLiteral(me.key)),
                            optional: me.optional || false,
                            // in TS, all methods are bivariant (i.e. Read/Write)
                            variance: Variance_1.default.ReadWrite,
                            valueType: normalizeFunctionTypeAnnotation(tsFunctionType, ctx),
                            mode: 'normal',
                            proto: false,
                            static: false,
                        });
                        break;
                    }
                    case 'TSIndexSignature': {
                        if (me.parameters.length !== 1) {
                            throw ctx.getError('Expected exactly one parameter for indexer', me);
                        }
                        const [parameter] = me.parameters;
                        const keyType = normalizeTypeAnnotation(parameter.typeAnnotation, ctx);
                        const valueType = normalizeTypeAnnotation(me.typeAnnotation, ctx);
                        if (!keyType) {
                            throw ctx.getError('Expected type annotation', parameter);
                        }
                        if (!valueType) {
                            throw ctx.getError('Expected type annotation', me);
                        }
                        properties.push({
                            kind: ObjectTypeAnnotation_1.ObjectTypeElementKind.ObjectTypeIndexer,
                            id: normalizeIdentifier(parameter),
                            keyType,
                            valueType,
                            variance: me.readonly ? Variance_1.default.ReadOnly : Variance_1.default.ReadWrite,
                            static: false,
                        });
                        break;
                    }
                    default:
                        ctx.assertNever('Unsupported object type member', me);
                }
            });
        }
        // e.g. type T = interface { p: string }
        default:
            return ctx.assertNever(`Unsupported type annotation type ${ta.type}`, ta);
    }
}
exports.normalizeType = normalizeType;
function normalizeTypeReference(ta, ctx) {
    const idNode = bt.isGenericTypeAnnotation(ta) || bt.isInterfaceExtends(ta)
        ? ta.id
        : ta.typeName;
    const params = ta.typeParameters
        ? ta.typeParameters.params
        : [];
    return {
        kind: TypeAnnotationKind_1.default.TypeReferenceAnnotation,
        id: normalizeTypeidentifier(idNode, ctx),
        typeParameters: params.map(p => normalizeType(p, ctx)),
        loc: ta.loc,
    };
}
function normalizeFunctionTypeAnnotation(ta, ctx) {
    switch (ta.type) {
        case 'FunctionTypeAnnotation':
            return {
                kind: TypeAnnotationKind_1.default.FunctionTypeAnnotation,
                params: ta.params.map(p => normalizeFunctionTypeParam(p, ctx)),
                restParam: ta.rest
                    ? normalizeFunctionTypeParam(ta.rest, ctx)
                    : undefined,
                typeParams: (ta.typeParameters ? ta.typeParameters.params : []).map(p => normalizeTypeParameter(p, ctx)),
                returnType: normalizeType(ta.returnType, ctx),
                loc: ta.loc,
            };
        case 'TSFunctionType':
        case 'TSCallSignatureDeclaration':
            const lastParam = ta.parameters[ta.parameters.length - 1];
            let restParam = undefined;
            let params = ta.parameters;
            if (bt.isRestElement(lastParam)) {
                restParam = lastParam;
                params = ta.parameters.slice(0, ta.parameters.length - 1);
            }
            return {
                kind: TypeAnnotationKind_1.default.FunctionTypeAnnotation,
                params: params.map(p => normalizeTsFunctionTypeParam(p, ctx)),
                restParam: restParam ? normalizeTsRestParam(restParam, ctx) : undefined,
                typeParams: (ta.typeParameters ? ta.typeParameters.params : []).map(p => normalizeTypeParameter(p, ctx)),
                returnType: normalizeTypeAnnotation(ta.typeAnnotation, ctx),
                loc: ta.loc,
            };
        default:
            return ctx.assertNever('Expected function type', ta);
    }
}
function normalizeFunctionTypeParam(p, ctx) {
    return {
        id: p.name ? normalizeIdentifier(p.name) : undefined,
        type: normalizeType(p.typeAnnotation, ctx),
        optional: p.optional || false,
        loc: p.loc,
    };
}
function normalizeTsFunctionTypeParam(p, ctx) {
    if (bt.isRestElement(p)) {
        throw ctx.getError('You can only have one rest element per function and it nust be the last parameter', p);
    }
    return {
        id: normalizeIdentifier(p),
        type: normalizeTypeAnnotation(p.typeAnnotation, ctx),
        optional: p.optional || false,
        loc: p.loc,
    };
}
function normalizeObjectTypeAnnotation(ta, ctx) {
    if (ta.internalSlots && ta.internalSlots.length) {
        throw ctx.getError(`TypeConvert does not support internal slots.`, ta.internalSlots[0]);
    }
    const callProperties = (ta.callProperties || []).map(cp => {
        if (cp.static) {
            /**
             * declare class A { static () : number }
             * const x: number = A();
             * const y: A = new A();
             */
            throw ctx.getError(`static call properties are not yet supported`, cp);
        }
        if (!bt.isFunctionTypeAnnotation(cp.value)) {
            throw ctx.getError(`Expected a function type but got ${cp.value.type}`, cp.value);
        }
        return normalizeFunctionTypeAnnotation(cp.value, ctx);
    });
    // e.g. type T = { p: string }
    const objectPropertyKey = (k) => {
        switch (k.type) {
            case 'Identifier':
                return {
                    kind: ExpressionKind_1.default.Identifier,
                    name: k.name,
                    loc: k.loc,
                };
            case 'StringLiteral':
                return {
                    kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                    value: k.value,
                    loc: ta.loc,
                };
            default:
                return ctx.assertNever(`Unrecognized key type`, k);
        }
    };
    const modeFromKind = (kind) => {
        switch (kind) {
            case 'init':
            case null:
                return 'normal';
            case 'get':
                return 'get';
            case 'set':
                return 'set';
            default:
                return ctx.assertNever(`Unsupported property kind ${kind}`, kind);
        }
    };
    return {
        kind: TypeAnnotationKind_1.default.ObjectTypeAnnotation,
        properties: ta.properties
            .map((p) => {
            switch (p.type) {
                case 'ObjectTypeProperty':
                    return {
                        kind: ObjectTypeAnnotation_1.ObjectTypeElementKind.ObjectTypeProperty,
                        computed: false,
                        valueType: normalizeType(p.value, ctx),
                        key: objectPropertyKey(p.key),
                        optional: p.optional || false,
                        variance: normalizeVariance(p.variance, ctx),
                        mode: modeFromKind(p.kind),
                        proto: p.proto || false,
                        static: p.static || false,
                    };
                case 'ObjectTypeSpreadProperty':
                    return {
                        kind: ObjectTypeAnnotation_1.ObjectTypeElementKind.ObjectTypeSpreadProperty,
                        argument: normalizeType(p.argument, ctx),
                    };
                default:
                    return ctx.assertNever(`Unexpected property type`, p);
            }
        })
            .concat((ta.indexers || []).map((indexer) => ({
            kind: ObjectTypeAnnotation_1.ObjectTypeElementKind.ObjectTypeIndexer,
            id: indexer.id ? normalizeIdentifier(indexer.id) : undefined,
            keyType: normalizeType(indexer.key, ctx),
            valueType: normalizeType(indexer.value, ctx),
            variance: normalizeVariance(indexer.variance, ctx),
            static: indexer.static || false,
        }))),
        callProperties,
        exact: ta.exact,
        inexact: ta.inexact || false,
        loc: ta.loc,
    };
}
function normalizeTSImportType(ta, ctx) {
    return {
        kind: TypeAnnotationKind_1.default.ImportTypeAnnotation,
        relativePath: ta.argument.value,
        qualifier: ta.qualifier
            ? normalizeTypeidentifier(ta.qualifier, ctx)
            : undefined,
        typeParameters: (ta.typeParameters ? ta.typeParameters.params : []).map(p => normalizeType(p, ctx)),
        loc: ta.loc,
    };
}
function normalizeTsRestParam(p, ctx) {
    return {
        id: bt.isIdentifier(p.argument)
            ? normalizeIdentifier(p.argument)
            : undefined,
        type: normalizeTypeAnnotation(p.typeAnnotation, ctx),
        optional: false,
        loc: p.loc,
    };
}
function normalizeVariance(v, ctx) {
    if (!v) {
        return Variance_1.default.ReadWrite;
    }
    switch (v.kind) {
        case 'plus':
            return Variance_1.default.ReadOnly;
        case 'minus':
            return Variance_1.default.WriteOnly;
        default:
            return ctx.assertNever(`Unsupported variance kind ${v.kind}`, v.kind);
    }
}
function normalizeTypeParameter(p, ctx) {
    const variance = normalizeVariance(bt.isTypeParameter(p) ? p.variance : null, ctx);
    const bound = bt.isTypeParameter(p)
        ? normalizeTypeAnnotation(p.bound, ctx)
        : normalizeType(p.constraint, ctx);
    return {
        id: p.name
            ? { kind: ExpressionKind_1.default.Identifier, name: p.name, loc: p.loc }
            : undefined,
        bound,
        default: normalizeType(p.default, ctx),
        variance,
        loc: p.loc,
    };
}
function normalizeIdentifier(id) {
    return { kind: ExpressionKind_1.default.Identifier, name: id.name, loc: id.loc };
}
function normalizeTypeidentifier(id, ctx) {
    if (bt.isIdentifier(id)) {
        return normalizeIdentifier(id);
    }
    if (bt.isQualifiedTypeIdentifier(id)) {
        return {
            kind: 'QualifiedTypeIdentifier',
            qualifier: normalizeTypeidentifier(id.qualification, ctx),
            property: normalizeIdentifier(id.id),
        };
    }
    if (bt.isTSQualifiedName(id)) {
        return {
            kind: 'QualifiedTypeIdentifier',
            qualifier: normalizeTypeidentifier(id.left, ctx),
            property: normalizeIdentifier(id.right),
        };
    }
    return ctx.assertNever('Unsupported type identifier kind', id);
}
function normalizeTsObjectKeyKey(key, ctx) {
    switch (key.type) {
        case 'Identifier':
            return normalizeIdentifier(key);
        case 'MemberExpression': {
            if (key.computed) {
                throw ctx.getError('Computed properties are not supported in object literals', key);
            }
            if (!bt.isIdentifier(key.property)) {
                throw ctx.getError('Expected key to be an identifier', key);
            }
            const object = normalizeTsObjectKeyKey(key.object, ctx);
            if (object.kind !== ExpressionKind_1.default.Identifier &&
                object.kind !== 'QualifiedTypeIdentifier') {
                throw ctx.getError('Unsupported object type ' + object.kind, key);
            }
            return {
                kind: 'QualifiedTypeIdentifier',
                qualifier: object,
                property: normalizeIdentifier(key.property),
            };
        }
        case 'BooleanLiteral':
        case 'NumericLiteral':
        case 'StringLiteral':
            return {
                kind: TypeAnnotationKind_1.default.LiteralTypeAnnotation,
                value: key.value,
                loc: key.loc,
            };
        default:
            throw ctx.getError('Unsupported key type ' + key.type, key);
    }
}
//# sourceMappingURL=normalizeTypeAnnotation.js.map