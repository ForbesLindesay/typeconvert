"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("../utils/Waitable");
const resolveTypeReference_1 = require("./resolveTypeReference");
var CompareResult;
(function (CompareResult) {
    CompareResult[CompareResult["AbeforeB"] = -1] = "AbeforeB";
    CompareResult[CompareResult["AafterB"] = 1] = "AafterB";
    CompareResult[CompareResult["AequalsB"] = 0] = "AequalsB";
})(CompareResult = exports.CompareResult || (exports.CompareResult = {}));
function compare(a, b, ctx) {
    if (a === b) {
        return CompareResult.AequalsB;
    }
    if (a instanceof Waitable_1.default) {
        return compare(a.getValue(), b, ctx);
    }
    if (b instanceof Waitable_1.default) {
        return compare(a, b.getValue(), ctx);
    }
    if (a.kind !== b.kind) {
        if (a.kind < b.kind) {
            return CompareResult.AbeforeB;
        } else {
            return CompareResult.AafterB;
        }
    }
    switch (a.kind) {
        case types_1.TypeKind.Any:
        case types_1.TypeKind.Boolean:
        case types_1.TypeKind.Null:
        case types_1.TypeKind.Number:
        case types_1.TypeKind.String:
        case types_1.TypeKind.Void:
            return CompareResult.AequalsB;
        case types_1.TypeKind.BooleanLiteral:
            return firstDifference(a, b, (a, b) => compareBooleans(a.value, b.value));
        case types_1.TypeKind.Function:
            return firstDifference(a, b, (a, b) =>
            // check params same length
            compareStringOrNumber(Waitable_1.default.resolve(a.params).length, Waitable_1.default.resolve(b.params).length), (a, b) =>
            // check each parm is the same
            firstDifference(a, b, ...Waitable_1.default.resolve(a.params).map((aParam, i) => () => compareFunctionParam(aParam, Waitable_1.default.resolve(b.params)[i], ctx))),
            // check rest params match
            (a, b) => compareFunctionParam(a.restParam, b.restParam, ctx),
            // check return types match
            (a, b) => compare(resolveTypeReference_1.default(a.returnType), resolveTypeReference_1.default(b.returnType), ctx));
        case types_1.TypeKind.GenericApplication:
            {
                const arg = compare(a.type, getB(a, b).type, ctx);
                if (arg !== CompareResult.AequalsB) {
                    return arg;
                }
                if (a.params.length < getB(a, b).params.length) {
                    return CompareResult.AbeforeB;
                }
                if (a.params.length > getB(a, b).params.length) {
                    return CompareResult.AafterB;
                }
                for (let i = 0; i < a.params.length; i++) {
                    const result = compare(a.params[i], getB(a, b).params[i], ctx);
                    if (result !== CompareResult.AequalsB) {
                        return result;
                    }
                }
                return CompareResult.AequalsB;
            }
        case types_1.TypeKind.Union:
        case types_1.TypeKind.Intersection:
            {
                const [aTypes, bTypes] = map(a, b, val => Waitable_1.default.resolve(val.types));
                function sortTypes(types) {
                    return types.map(t => resolveTypeReference_1.default(t)).sort((a, b) => compare(a, b, ctx));
                }
                return firstDifference(a, b, () => compareStringOrNumber(aTypes.length, bTypes.length), () => {
                    const aTypesSorted = sortTypes(aTypes);
                    const bTypesSorted = sortTypes(bTypes);
                    return firstDifference(a, b, ...aTypesSorted.map((a, i) => () => compare(a, bTypesSorted[i], ctx)));
                });
                // const aTypes = a.types.slice().sort((a, b) => compare(a, b, ctx));
                // const bTypes = getB(a, b)
                //   .types.slice()
                //   .sort((a, b) => compare(a, b, ctx));
                // if (aTypes.length < bTypes.length) {
                //   return CompareResult.AbeforeB;
                // }
                // if (aTypes.length > bTypes.length) {
                //   return CompareResult.AafterB;
                // }
                // for (let i = 0; i < aTypes.length; i++) {
                //   const result = compare(aTypes[i], bTypes[i], ctx);
                //   if (result !== CompareResult.AequalsB) {
                //     return result;
                //   }
                // }
                // return CompareResult.AequalsB;
            }
        case types_1.TypeKind.NumericLiteral:
            return firstDifference(a, b, (a, b) => compareStringOrNumber(a.value, b.value));
        case types_1.TypeKind.Object:
            {
                if (a.exact && !getB(a, b)) {
                    return CompareResult.AbeforeB;
                }
                if (!a.exact && getB(a, b)) {
                    return CompareResult.AafterB;
                }
                const aProps = a.properties.sort((a, b) => a.name < b.name ? CompareResult.AbeforeB : CompareResult.AafterB);
                const bProps = getB(a, b).properties.slice().sort((a, b) => a.name < b.name ? CompareResult.AbeforeB : CompareResult.AafterB);
                if (aProps.length < bProps.length) {
                    return CompareResult.AbeforeB;
                }
                if (aProps.length > bProps.length) {
                    return CompareResult.AafterB;
                }
                for (let i = 0; i < aProps.length; i++) {
                    if (aProps[i].name < bProps[i].name) {
                        return CompareResult.AbeforeB;
                    }
                    if (aProps[i].name > bProps[i].name) {
                        return CompareResult.AafterB;
                    }
                    if (aProps[i].variance < bProps[i].variance) {
                        return CompareResult.AbeforeB;
                    }
                    if (aProps[i].variance > bProps[i].variance) {
                        return CompareResult.AafterB;
                    }
                    if (aProps[i].optional && !bProps[i].optional) {
                        return CompareResult.AbeforeB;
                    }
                    if (!aProps[i].optional && bProps[i].optional) {
                        return CompareResult.AafterB;
                    }
                    const result = compare(aProps[i].type, bProps[i].type, ctx);
                    if (result !== CompareResult.AequalsB) {
                        return result;
                    }
                }
                return CompareResult.AequalsB;
            }
        case types_1.TypeKind.StringLiteral:
            return firstDifference(a, b, (a, b) => compareStringOrNumber(a.value, b.value));
        case types_1.TypeKind.Tuple:
            {
                return firstDifference(a, b, (a, b) =>
                // check tuples are the same length
                compareStringOrNumber(Waitable_1.default.resolve(a.types).length, Waitable_1.default.resolve(b.types).length), (a, b) =>
                // check each type in the tuple is the same
                // N.B. not sorting becuase order of tuple matters
                firstDifference(a, b, ...Waitable_1.default.resolve(a.types).map((aType, i) => () => compare(resolveTypeReference_1.default(aType), resolveTypeReference_1.default(Waitable_1.default.resolve(a.types)[i]), ctx))));
            }
        default:
            return ctx.assertNever('Unable to compare', a);
    }
}
exports.default = compare;
function getB(a, b) {
    if (a.kind !== b.kind) {
        throw new Error('Expected a.kind === b.kind');
    }
    return b;
}
function map(a, b, map) {
    return [map(a), map(b)];
}
function firstDifference(a, b, ...comparisons) {
    if (a.kind !== b.kind) {
        throw new Error('Expected a.kind === b.kind');
    }
    for (let i = 0; i < comparisons.length; i++) {
        const comparison = comparisons[i];
        const result = typeof comparison === 'function' ? comparison(a, b) : comparison;
        if (result !== CompareResult.AequalsB) {
            return result;
        }
    }
    return CompareResult.AequalsB;
}
function compareBooleans(a, b) {
    const aVal = Waitable_1.default.resolve(a);
    const bVal = Waitable_1.default.resolve(b);
    if (aVal && !bVal) {
        return CompareResult.AbeforeB;
    }
    if (!aVal && bVal) {
        return CompareResult.AafterB;
    }
    return CompareResult.AequalsB;
}
function compareStringOrNumber(a, b) {
    const aVal = Waitable_1.default.resolve(a);
    const bVal = Waitable_1.default.resolve(b);
    if (aVal < bVal) {
        return CompareResult.AbeforeB;
    }
    if (aVal > bVal) {
        return CompareResult.AafterB;
    }
    return CompareResult.AequalsB;
}
function compareFunctionParam(a, b, ctx) {
    const aVal = Waitable_1.default.resolve(a);
    const bVal = Waitable_1.default.resolve(b);
    if (aVal && !bVal) {
        return CompareResult.AbeforeB;
    }
    if (!aVal && bVal) {
        return CompareResult.AafterB;
    }
    if (!aVal || !bVal) {
        return CompareResult.AequalsB;
    }
    return compare(resolveTypeReference_1.default(aVal.type), resolveTypeReference_1.default(bVal.type), ctx);
}
//# sourceMappingURL=compareTypes.js.map