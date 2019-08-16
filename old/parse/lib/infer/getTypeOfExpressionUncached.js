"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
const extractFunction_1 = require("../extractFunction");
const mergeTypes_1 = require("./mergeTypes");
function getTypeOfExpressionUncached(expression, ctx) {
    const loc = expression.loc && new types_1.SourceLocation(expression.loc);
    switch (expression.type) {
        case 'ArrowFunctionExpression':
            {
                const { typeParameters, params, restParam, returnType } = extractFunction_1.default(expression, ctx);
                return {
                    kind: types_1.TypeKind.Function,
                    params,
                    returnType,
                    restParam,
                    typeParameters,
                    loc
                };
            }
        case 'BooleanLiteral':
            return {
                kind: types_1.TypeKind.BooleanLiteral,
                value: expression.value,
                loc
            };
        case 'CallExpression':
            let type = getTypeOfExpression(expression.callee, ctx);
            if (type.kind === types_1.TypeKind.TypeOf) {
                const t = ctx.getResolvedTypeOfIdentifierValue(type);
                if (!t) {
                    throw ctx.getError('Could not resolve callee type', expression.callee);
                }
                type = t;
            }
            const types = type.kind === types_1.TypeKind.Function ? [type] : type.kind === types_1.TypeKind.Intersection ? type.types.filter(t => t.kind === types_1.TypeKind.Function) : [];
            const args = expression.arguments.map(e => getTypeOfExpression(e, ctx)).map(arg => {
                if (arg.kind === types_1.TypeKind.TypeOf) {
                    return ctx.getResolvedTypeOfIdentifierValue(arg);
                } else {
                    return arg;
                }
            });
            for (const type of types) {
                const assignment = fnMatches(args, type, ctx);
                if (assignment) {
                    return applyTypeParameterAssignment(type.returnType, assignment);
                }
            }
            console.log(args);
            throw ctx.getError('Unable to infer result of call expression', expression);
        case 'ConditionalExpression':
            return mergeTypes_1.default(loc, getTypeOfExpression(expression.consequent, ctx), getTypeOfExpression(expression.alternate, ctx));
        case 'Identifier':
            return ctx.getTypeOfIdentifierValue(expression);
        case 'NumericLiteral':
            return {
                kind: types_1.TypeKind.NumericLiteral,
                value: expression.value,
                loc
            };
        case 'ObjectExpression':
            const properties = [];
            for (let prop of expression.properties) {
                if (prop.type === 'SpreadElement' || prop.type === 'ObjectMethod') {
                    throw ctx.getError('Unsupported object element', prop);
                } else {
                    if (prop.computed) {
                        throw ctx.getError('computed properties are not supported', prop);
                    }
                    properties.push({
                        name: prop.key.name,
                        optional: false,
                        type: getTypeOfExpression(prop.value, ctx),
                        variance: types_1.Variance.invariant,
                        loc: prop.loc && new types_1.SourceLocation(prop.loc)
                    });
                }
            }
            return {
                kind: types_1.TypeKind.Object,
                exact: true,
                properties,
                loc
            };
        case 'TemplateLiteral':
            if (expression.expressions.length || expression.quasis.length !== 1) {
                return { kind: types_1.TypeKind.String, loc };
            }
            if (typeof expression.quasis[0].value.cooked !== 'string') {
                throw ctx.getError('expected template literal to have cooked value', expression);
            }
            return {
                kind: types_1.TypeKind.StringLiteral,
                value: expression.quasis[0].value.cooked,
                loc
            };
        default:
            return ctx.assertNever('Unsupported expression type ' + expression.type, expression);
    }
}
exports.default = getTypeOfExpressionUncached;
class TypeParameterAssignment {
    constructor(typeParameter, ctx, parent) {
        this.types = [];
        this.typeParameter = typeParameter;
        this.ctx = ctx;
        this.parent = parent;
    }
    tryAssign(type) {
        this.types.push(type);
        if (this.parent) {
            return isSubType(type, this.parent.type, null, this.parent.assignments, this.ctx);
        }
        return true;
    }
    getType() {
        if (this.types.length === 0) {
            return { kind: types_1.TypeKind.Any, loc: null };
        }
        return mergeTypes_1.default(this.types[0].loc, ...this.types);
    }
}
class TypeParameterAssignments {
    constructor(typeParameters, ctx, assignments, parent) {
        this._assignments = new Map();
        typeParameters.forEach((p, i) => {
            if (assignments && parent && assignments[i]) {
                this._assignments.set(p.name, new TypeParameterAssignment(p, ctx, {
                    type: assignments[i],
                    assignments: parent
                }));
            } else {
                this._assignments.set(p.name, new TypeParameterAssignment(p, ctx));
            }
        });
    }
    getType(name) {
        const result = this._assignments.get(name);
        if (!result) {
            return null;
        }
        return result.getType();
    }
    tryToAssign(name, type) {
        const result = this._assignments.get(name);
        if (result) {
            return result.tryAssign(type);
        }
        return false;
    }
}
function fnMatches(args, fn, ctx) {
    const assignment = new TypeParameterAssignments(fn.typeParameters, ctx);
    for (let i = 0; i < fn.params.length; i++) {
        if (fn.params[i].optional && (!args[i] || args[i].kind === types_1.TypeKind.Void)) {
            continue;
        }
        if (!args[i]) {
            return false;
        }
        if (!isSubType(args[i], fn.params[i].type, null, assignment, ctx)) {
            return false;
        }
    }
    // TODO: rest params
    return assignment;
}
function isSubType(child, parent, childTypeParams, parentTypeParams, ctx) {
    if (childTypeParams && child.kind === types_1.TypeKind.Reference) {
        // TODO: this should be some kind of reverse assignment
        if (childTypeParams.tryToAssign(child.name, parent)) {
            return true;
        }
    }
    switch (parent.kind) {
        case types_1.TypeKind.Any:
            return true;
        case types_1.TypeKind.Boolean:
            return child.kind === types_1.TypeKind.Boolean || child.kind === types_1.TypeKind.BooleanLiteral;
        case types_1.TypeKind.BooleanLiteral:
            return child.kind === types_1.TypeKind.BooleanLiteral && child.value === parent.value;
        case types_1.TypeKind.Function:
            if (child.kind !== types_1.TypeKind.Function) {
                return false;
            }
            return child.params.every((param, i) => {
                if (param.optional && !parent.params[i]) {
                    return true;
                }
                if (!parent.params[i]) {
                    return false;
                }
                if (!param.optional && parent.params[i].optional) {
                    return false;
                }
                return isSubType(
                // swapping parent and child
                parent.params[i].type, param.type, parentTypeParams, childTypeParams, ctx);
            }) && isSubType(child.returnType, parent.returnType, childTypeParams, parentTypeParams, ctx) && (!child.restParam || !parent.restParam || isSubType(
            // we swap child and parent for rest param
            parent.restParam.type, child.restParam.type, parentTypeParams, childTypeParams, ctx));
        case types_1.TypeKind.GenericApplication:
            {
                if (parent.type.kind !== types_1.TypeKind.Reference) {
                    return false;
                }
                const parentResolved = ctx.getResolvedTypeFromIdentifier(parent.type);
                if (!parentResolved) {
                    return false;
                }
                if (parentResolved.kind !== types_1.TypeKind.Function && parentResolved.kind !== types_1.TypeKind.Generic) {
                    throw new Error('Unsupported child kind for generic ' + child.kind);
                }
                return isSubType(child, parentResolved.kind === types_1.TypeKind.Generic ? parentResolved.type : parentResolved, childTypeParams, parentTypeParams && new TypeParameterAssignments(parentResolved.typeParameters, ctx, parent.params,
                // TODO: is this nullable?
                parentTypeParams), ctx);
            }
        case types_1.TypeKind.Null:
            return child.kind === types_1.TypeKind.Null;
        case types_1.TypeKind.Number:
            return child.kind === types_1.TypeKind.Number || child.kind === types_1.TypeKind.NumericLiteral;
        case types_1.TypeKind.NumericLiteral:
            return child.kind === types_1.TypeKind.NumericLiteral && child.value === parent.value;
        case types_1.TypeKind.Reference:
            if (parentTypeParams && parentTypeParams.tryToAssign(parent.name, child)) {
                return true;
            }
            const parentResolved = ctx.getResolvedTypeFromIdentifier(parent);
            if (!parentResolved) {
                return false;
            }
            return isSubType(child, parentResolved, childTypeParams, null, ctx);
        case types_1.TypeKind.String:
            return child.kind === types_1.TypeKind.String || child.kind === types_1.TypeKind.StringLiteral;
        case types_1.TypeKind.StringLiteral:
            return child.kind === types_1.TypeKind.StringLiteral && child.value === parent.value;
        case types_1.TypeKind.Union:
            return parent.types.some(type => isSubType(child, type, childTypeParams, parentTypeParams, ctx));
        case types_1.TypeKind.Void:
            return child.kind === types_1.TypeKind.Void;
        default:
            throw ctx.getError('Unsupported type ' + parent.kind, parent);
            return parent;
    }
}
function applyTypeParameterAssignment(type, assignments) {
    switch (type.kind) {
        case types_1.TypeKind.Any:
        case types_1.TypeKind.Boolean:
        case types_1.TypeKind.BooleanLiteral:
        case types_1.TypeKind.Null:
        case types_1.TypeKind.Number:
        case types_1.TypeKind.NumericLiteral:
        case types_1.TypeKind.String:
        case types_1.TypeKind.StringLiteral:
        case types_1.TypeKind.TypeOf:
        case types_1.TypeKind.Void:
            return type;
        case types_1.TypeKind.Function:
            return {
                kind: types_1.TypeKind.Function,
                params: type.params.map(p => Object.assign({}, p, { type: applyTypeParameterAssignment(p.type, assignments) })),
                restParam: type.restParam && Object.assign({}, type.restParam, { type: applyTypeParameterAssignment(type.restParam.type, assignments) }),
                returnType: applyTypeParameterAssignment(type.returnType, assignments),
                typeParameters: type.typeParameters,
                loc: type.loc
            };
        case types_1.TypeKind.Generic:
            return type;
        case types_1.TypeKind.GenericApplication:
            return {
                kind: types_1.TypeKind.GenericApplication,
                type: type.type,
                params: type.params.map(t => applyTypeParameterAssignment(t, assignments)),
                loc: type.loc
            };
        case types_1.TypeKind.Intersection:
            return {
                kind: types_1.TypeKind.Intersection,
                types: type.types.map(t => applyTypeParameterAssignment(t, assignments)),
                loc: type.loc
            };
        case types_1.TypeKind.Object:
            return {
                kind: types_1.TypeKind.Object,
                exact: type.exact,
                properties: type.properties.map(p => Object.assign({}, p, { type: applyTypeParameterAssignment(p.type, assignments) })),
                loc: type.loc
            };
        case types_1.TypeKind.Reference:
            return assignments.getType(type.name) || type;
        case types_1.TypeKind.Tuple:
            return {
                kind: types_1.TypeKind.Tuple,
                types: type.types.map(t => applyTypeParameterAssignment(t, assignments)),
                loc: type.loc
            };
        case types_1.TypeKind.Union:
            return mergeTypes_1.default(type.loc, ...type.types.map(t => applyTypeParameterAssignment(t, assignments)));
    }
}
//# sourceMappingURL=getTypeOfExpressionUncached.js.map