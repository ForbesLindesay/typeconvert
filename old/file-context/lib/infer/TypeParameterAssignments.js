"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Waitable_1 = require("../utils/Waitable");
const immutable_1 = require("immutable");
const resolveTypeReference_1 = require("./resolveTypeReference");
const isSubType_1 = require("./isSubType");
// "<T>x is a subclass of <S>y" means forall S there exists a T such that "<T>x is a subclass of <S>y"
// this is at the point where the "Generic" type occurs
var TypeParameterAssignmentMode;
(function (TypeParameterAssignmentMode) {
    TypeParameterAssignmentMode[TypeParameterAssignmentMode["ForAll"] = 0] = "ForAll";
    TypeParameterAssignmentMode[TypeParameterAssignmentMode["Exists"] = 1] = "Exists";
})(TypeParameterAssignmentMode = exports.TypeParameterAssignmentMode || (exports.TypeParameterAssignmentMode = {}));
function typeParameterNotFound(tp, type, assignments, ctx) {
    throw ctx.getError('Could not find type parameter ' + Waitable_1.default.resolve(Waitable_1.default.resolve(tp).name), Waitable_1.default.resolve(tp));
}
exports.RootTypeParameterAssignments = {
    trySetLowerBound: typeParameterNotFound,
    trySetUpperBound: typeParameterNotFound
};
class TypeParameterAssignments {
    constructor(mode, typeParameters, parent) {
        this.assignments = immutable_1.Map();
        this.mode = mode;
        if (typeParameters) {
            typeParameters.map(tp => Waitable_1.default.resolve(tp)).forEach(tp => {
                const extendsType = Waitable_1.default.resolve(tp.extends);
                this.assignments.set(tp, {
                    upperBounds: extendsType ? immutable_1.Set([resolveTypeReference_1.default(extendsType, parent)]) : immutable_1.Set(),
                    lowerBounds: immutable_1.Set()
                });
            });
        }
        this.parent = parent;
    }
    // i.e. number extends T
    trySetLowerBound(tp, type, assignments, ctx) {
        const typeParam = Waitable_1.default.resolve(tp);
        const t = Waitable_1.default.resolve(type);
        const current = this.assignments.get(typeParam);
        if (!current) {
            return this.parent.trySetLowerBound(tp, type, assignments, ctx);
        }
        switch (this.mode) {
            case TypeParameterAssignmentMode.Exists:
                if (
                // allowed if sub type of all the upper bounds
                current.upperBounds.every(ub => isSubType_1.isSubTypeInner(t, assignments, ub.type, ub.assignments, ctx))) {
                    this.assignments = this.assignments.set(typeParam, {
                        upperBounds: current.upperBounds,
                        lowerBounds: current.lowerBounds.add({ type: t, assignments })
                    });
                    return true;
                }
                return false;
            case TypeParameterAssignmentMode.ForAll:
                // allowed if there is already a lower bound that includes more types
                // i.e. asserting 1 extends T is not necessary after asserting number extends T
                // becuase 1 is a sub type of all numbers
                if (current.lowerBounds.some(lb => isSubType_1.isSubTypeInner(t, assignments, lb.type, lb.assignments, ctx))) {
                    return true;
                }
                return false;
            default:
                return ctx.assertNever('Unsupported mode', this.mode);
        }
    }
    // i.e. T extends number
    trySetUpperBound(tp, type, assignments, ctx) {
        const typeParam = Waitable_1.default.resolve(tp);
        const t = Waitable_1.default.resolve(type);
        const current = this.assignments.get(typeParam);
        if (!current) {
            return this.parent.trySetLowerBound(tp, type, assignments, ctx);
        }
        switch (this.mode) {
            case TypeParameterAssignmentMode.Exists:
                if (
                // allowed if super type of all the lower bounds
                current.lowerBounds.every(lb => isSubType_1.isSubTypeInner(lb.type, lb.assignments, type, assignments, ctx))) {
                    this.assignments = this.assignments.set(typeParam, {
                        upperBounds: current.upperBounds.add({ type: t, assignments }),
                        lowerBounds: current.lowerBounds
                    });
                    return true;
                }
                return false;
            case TypeParameterAssignmentMode.ForAll:
                // allowed if there is already an upper bound that includes fewer types
                // i.e. asserting T extends number is not necessary after asserting T extends 1
                // becuase 1 is a sub type of all numbers
                if (
                // there exists an upper bound (e.g. `1`)
                // such that ub is sub type of type
                // e.g. 1 is sub type of number
                current.upperBounds.some(ub => isSubType_1.isSubTypeInner(ub.type, ub.assignments, t, assignments, ctx))) {
                    return true;
                }
                return false;
            default:
                return ctx.assertNever('Unsupported mode', this.mode);
        }
    }
}
exports.TypeParameterAssignments = TypeParameterAssignments;
//# sourceMappingURL=TypeParameterAssignments.js.map