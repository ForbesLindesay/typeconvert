"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("../utils/Waitable");
const resolveTypeReference_1 = require("./resolveTypeReference");
const TypeParameterAssignments_1 = require("./TypeParameterAssignments");
// TODO: this uses all the wrong assignments
/**
 * @return a is sub type of b
 */
function isSubTypeInner(a, aTypeParamAssignments, b, bTypeParamAssignments, ctx) {
    if (a === b) {
        return true;
    }
    if (a instanceof Waitable_1.default) {
        return isSubTypeInner(a.getValue(), aTypeParamAssignments, b, bTypeParamAssignments, ctx);
    }
    if (b instanceof Waitable_1.default) {
        return isSubTypeInner(a, aTypeParamAssignments, b.getValue(), bTypeParamAssignments, ctx);
    }
    if (a.kind === types_1.TypeKind.Intersection) {
        return Waitable_1.default.resolve(a.types).some(t => isSubTypeInner(resolveTypeReference_1.default(t), aTypeParamAssignments, b, bTypeParamAssignments, ctx));
    }
    if (a.kind === types_1.TypeKind.Union) {
        return Waitable_1.default.resolve(a.types).every(t => isSubTypeInner(resolveTypeReference_1.default(t), aTypeParamAssignments, b, bTypeParamAssignments, ctx));
    }
    // if a is a type parameter, add an upper bound
    if (a.kind === types_1.TypeKind.TypeParameterReference) {
        // if a is explicilty flexible, continue as normal
        //  e.g. <T>(a: T) => number is sub type of (a: number) => number
        return aTypeParamAssignments.getAssignment(Waitable_1.default.resolve(a.param)).tryAddUpperBound(b, bTypeParamAssignments, ctx);
    }
    // if b is a type parameter, add a lower bound
    if (b.kind === types_1.TypeKind.TypeParameterReference) {
        // if b is explicitly flexible, a must be a Type Parameter and
        // is bound to this type parameter e.g.
        // (a: number) => number is not a sub type of <T>(a: number) => T
        return bTypeParamAssignments.getAssignment(Waitable_1.default.resolve(b.param)).tryAddLowerBound(a, aTypeParamAssignments, ctx);
    }
    switch (b.kind) {
        case types_1.TypeKind.Any:
            return true;
        case types_1.TypeKind.Boolean:
            return a.kind === types_1.TypeKind.Boolean || a.kind === types_1.TypeKind.BooleanLiteral;
        case types_1.TypeKind.BooleanLiteral:
            return a.kind === types_1.TypeKind.BooleanLiteral && Waitable_1.default.resolve(a.value) === Waitable_1.default.resolve(b.value);
        case types_1.TypeKind.Function:
            {
                if (a.kind !== types_1.TypeKind.Function) {
                    return false;
                }
                const aTypeParameters = Waitable_1.default.resolve(a.typeParameters);
                const aChildTypeParams = new TypeParameterAssignments(aTypeParameters, aTypeParamAssignments);
                const bTypeParameters = Waitable_1.default.resolve(b.typeParameters);
                const bChildTypeParams = new TypeParameterAssignments(bTypeParameters, bTypeParamAssignments);
                const aParams = Waitable_1.default.resolve(a.params).map(p => Waitable_1.default.resolve(p));
                const bParams = Waitable_1.default.resolve(b.params).map(p => Waitable_1.default.resolve(p));
                const aRestParam = Waitable_1.default.resolve(a.restParam);
                const bRestParam = Waitable_1.default.resolve(b.restParam);
                if (!aParams.every((aParam, i) => {
                    const aIsOptional = () => Waitable_1.default.resolve(aParam.optional) || isSubTypeInner({ kind: types_1.TypeKind.Void, loc: null }, bChildTypeParams, resolveTypeReference_1.default(aParam.type), aChildTypeParams, ctx);
                    if (i >= bParams.length) {
                        // TODO: what about rest params?
                        return aIsOptional();
                    }
                    const bParam = bParams[i];
                    if (Waitable_1.default.resolve(bParam.optional) && !aIsOptional()) {
                        return false;
                    }
                    // TODO: add "void" to type list if aParam is optional
                    return isSubTypeInner(resolveTypeReference_1.default(bParam.type), bChildTypeParams, resolveTypeReference_1.default(aParam.type), aChildTypeParams, ctx);
                })) {
                    return false;
                }
                if (aRestParam) {
                    // TODO: check any other extra params that b passes
                    if (bRestParam && !isSubTypeInner(resolveTypeReference_1.default(bRestParam.type), bChildTypeParams, resolveTypeReference_1.default(aRestParam.type), aChildTypeParams, ctx)) {
                        return false;
                    }
                }
                if (!isSubTypeInner(resolveTypeReference_1.default(a.returnType), aChildTypeParams, resolveTypeReference_1.default(b.returnType), bChildTypeParams, ctx)) {
                    return false;
                }
                // TODO: b should not have any new type param constraints
                // i.e. (x: string) => string should not be a sub type of <T>(x: T) => T
                return true;
            }
        case types_1.TypeKind.Generic:
            return ctx.assertNever('Not Implemented: ' + b.kind, b);
        case types_1.TypeKind.GenericApplication:
            return ctx.assertNever('Not Implemented: ' + b.kind, b);
        case types_1.TypeKind.Intersection:
            return Waitable_1.default.resolve(b.types).every(t => isSubTypeInner(a, aTypeParamAssignments, resolveTypeReference_1.default(t), bTypeParamAssignments, ctx));
        case types_1.TypeKind.Null:
            return a.kind === types_1.TypeKind.Null;
        case types_1.TypeKind.Number:
            return a.kind === types_1.TypeKind.Number || a.kind === types_1.TypeKind.NumericLiteral;
        case types_1.TypeKind.NumericLiteral:
            return a.kind === types_1.TypeKind.NumericLiteral && Waitable_1.default.resolve(a.value) === Waitable_1.default.resolve(b.value);
        case types_1.TypeKind.Object:
            {
                if (a.kind !== types_1.TypeKind.Object) {
                    // TODO: technically you can assign anything to `{}`
                    // at least in typescript
                    return false;
                }
                const exact = Waitable_1.default.resolve(b.exact);
                if (exact && !Waitable_1.default.resolve(a.exact)) {
                    return false;
                }
                const aProperties = Waitable_1.default.resolve(a.properties);
                const bProperties = Waitable_1.default.resolve(b.properties);
                if (exact && aProperties.some(p => {
                    const prop = Waitable_1.default.resolve(p);
                    const aName = Waitable_1.default.resolve(prop.name);
                    return !bProperties.some(p => {
                        const prop = Waitable_1.default.resolve(p);
                        const name = Waitable_1.default.resolve(prop.name);
                        return aName === name;
                    });
                })) {
                    return false;
                }
                return bProperties.every(bp => {
                    const bProp = Waitable_1.default.resolve(bp);
                    const bName = Waitable_1.default.resolve(bProp.name);
                    const ap = aProperties.find(p => {
                        const prop = Waitable_1.default.resolve(p);
                        const aName = Waitable_1.default.resolve(prop.name);
                        return aName === bName;
                    });
                    if (!ap) {
                        return Waitable_1.default.resolve(bProp.optional);
                    }
                    const aProp = Waitable_1.default.resolve(ap);
                    if (aProp.optional && !bProp.optional) {
                        return false;
                    }
                    const aVariance = Waitable_1.default.resolve(aProp.variance);
                    const bVariance = Waitable_1.default.resolve(bProp.variance);
                    switch (bVariance) {
                        case types_1.Variance.bivariant:
                            // bivariant is actually a nonsense, but the
                            // default in typescript. It should be
                            // invariant, but actually allows most of
                            // the covariant/contravariant stuff
                            return aVariance !== types_1.Variance.covariant && aVariance !== types_1.Variance.contravariant && (isSubTypeInner(resolveTypeReference_1.default(aProp.type), aTypeParamAssignments, resolveTypeReference_1.default(bProp.type), bTypeParamAssignments, ctx) || isSubTypeInner(resolveTypeReference_1.default(bProp.type), bTypeParamAssignments, resolveTypeReference_1.default(aProp.type), aTypeParamAssignments, ctx));
                        case types_1.Variance.contravariant:
                            return aVariance !== types_1.Variance.covariant && isSubTypeInner(resolveTypeReference_1.default(bProp.type), bTypeParamAssignments, resolveTypeReference_1.default(aProp.type), aTypeParamAssignments, ctx);
                        case types_1.Variance.covariant:
                            return aVariance !== types_1.Variance.contravariant && isSubTypeInner(resolveTypeReference_1.default(aProp.type), aTypeParamAssignments, resolveTypeReference_1.default(bProp.type), bTypeParamAssignments, ctx);
                        case types_1.Variance.invariant:
                            return aVariance !== types_1.Variance.covariant && aVariance !== types_1.Variance.contravariant && isSubTypeInner(resolveTypeReference_1.default(aProp.type), aTypeParamAssignments, resolveTypeReference_1.default(bProp.type), bTypeParamAssignments, ctx) && isSubTypeInner(resolveTypeReference_1.default(bProp.type), bTypeParamAssignments, resolveTypeReference_1.default(aProp.type), aTypeParamAssignments, ctx);
                        default:
                            return ctx.assertNever('Invalid variance', bVariance);
                    }
                });
            }
        case types_1.TypeKind.String:
            return a.kind === types_1.TypeKind.String || a.kind === types_1.TypeKind.StringLiteral;
        case types_1.TypeKind.StringLiteral:
            return a.kind === types_1.TypeKind.StringLiteral && Waitable_1.default.resolve(a.value) === Waitable_1.default.resolve(b.value);
        case types_1.TypeKind.Tuple:
            {
                if (a.kind !== types_1.TypeKind.Tuple) {
                    return false;
                }
                const aTypes = Waitable_1.default.resolve(a.types);
                const bTypes = Waitable_1.default.resolve(b.types);
                if (aTypes.length !== bTypes.length) {
                    return false;
                }
                return aTypes.every((aTypeRef, i) => isSubTypeInner(resolveTypeReference_1.default(aTypeRef), aTypeParamAssignments, resolveTypeReference_1.default(bTypes[i]), bTypeParamAssignments, ctx));
            }
        case types_1.TypeKind.Union:
            return Waitable_1.default.resolve(b.types).some(t => isSubTypeInner(a, aTypeParamAssignments, resolveTypeReference_1.default(t), bTypeParamAssignments, ctx));
        case types_1.TypeKind.Void:
            return b.kind === types_1.TypeKind.Void;
        default:
            return ctx.assertNever('Unsupported type', b);
    }
}
exports.isSubTypeInner = isSubTypeInner;
function isSubType(a, b, ctx) {
    return isSubTypeInner(a, TypeParameterAssignments_1.RootTypeParameterAssignments, b, TypeParameterAssignments_1.RootTypeParameterAssignments, ctx);
}
exports.default = isSubType;
//# sourceMappingURL=isSubType.js.map