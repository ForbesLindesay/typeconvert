import * as bt from '@babel/types';
import {
  FunctionType,
  Type,
  TypeKind,
  ObjectProperty,
  Variance,
  TypeParameter,
  SourceLocation,
} from '@typeconvert/types';
import {InferScopeContext} from './InferContext';
import extractFunction from '../extractFunction';
import unionTypes from './mergeTypes';

export default function getTypeOfExpressionUncached(
  expression: bt.Expression,
  ctx: InferScopeContext,
): Type {
  const loc = expression.loc && new SourceLocation(expression.loc);
  switch (expression.type) {
    case 'ArrowFunctionExpression': {
      const {typeParameters, params, restParam, returnType} = extractFunction(
        expression,
        ctx,
      );
      return {
        kind: TypeKind.Function,
        params,
        returnType,
        restParam,
        typeParameters,
        loc,
      };
    }
    case 'BooleanLiteral':
      return {
        kind: TypeKind.BooleanLiteral,
        value: expression.value,
        loc,
      };
    case 'CallExpression':
      let type = getTypeOfExpression(expression.callee, ctx);
      if (type.kind === TypeKind.TypeOf) {
        const t = ctx.getResolvedTypeOfIdentifierValue(type);
        if (!t) {
          throw ctx.getError(
            'Could not resolve callee type',
            expression.callee,
          );
        }
        type = t;
      }
      const types =
        type.kind === TypeKind.Function
          ? [type]
          : type.kind === TypeKind.Intersection
            ? type.types.filter(
                (t): t is FunctionType => t.kind === TypeKind.Function,
              )
            : [];
      const args = expression.arguments
        .map(e => getTypeOfExpression(e as bt.Expression, ctx))
        .map(arg => {
          if (arg.kind === TypeKind.TypeOf) {
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
      throw ctx.getError(
        'Unable to infer result of call expression',
        expression,
      );
    case 'ConditionalExpression':
      return unionTypes(
        loc,
        getTypeOfExpression(expression.consequent, ctx),
        getTypeOfExpression(expression.alternate, ctx),
      );
    case 'Identifier':
      return ctx.getTypeOfIdentifierValue(expression);
    case 'NumericLiteral':
      return {
        kind: TypeKind.NumericLiteral,
        value: expression.value,
        loc,
      };
    case 'ObjectExpression':
      const properties: ObjectProperty[] = [];
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
            type: getTypeOfExpression(prop.value as bt.Expression, ctx),
            variance: Variance.invariant,
            loc: prop.loc && new SourceLocation(prop.loc),
          });
        }
      }
      return {
        kind: TypeKind.Object,
        exact: true,
        properties,
        loc,
      };
    case 'TemplateLiteral':
      if (expression.expressions.length || expression.quasis.length !== 1) {
        return {kind: TypeKind.String, loc};
      }
      if (typeof expression.quasis[0].value.cooked !== 'string') {
        throw ctx.getError(
          'expected template literal to have cooked value',
          expression,
        );
      }
      return {
        kind: TypeKind.StringLiteral,
        value: expression.quasis[0].value.cooked,
        loc,
      };
    default:
      return ctx.assertNever(
        'Unsupported expression type ' + expression.type,
        expression,
      );
  }
}

interface TypeParameterAssignmentParent {
  type: Type;
  assignments: TypeParameterAssignments;
}
class TypeParameterAssignment {
  public readonly typeParameter: TypeParameter;
  private readonly ctx: Context;
  private readonly parent: TypeParameterAssignmentParent | undefined;
  private readonly types: Type[] = [];
  constructor(
    typeParameter: TypeParameter,
    ctx: Context,
    parent?: TypeParameterAssignmentParent,
  ) {
    this.typeParameter = typeParameter;
    this.ctx = ctx;
    this.parent = parent;
  }
  tryAssign(type: Type): boolean {
    this.types.push(type);
    if (this.parent) {
      return isSubType(
        type,
        this.parent.type,
        null,
        this.parent.assignments,
        this.ctx,
      );
    }
    return true;
  }
  getType(): Type {
    if (this.types.length === 0) {
      return {kind: TypeKind.Any, loc: null};
    }
    return unionTypes(this.types[0].loc, ...this.types);
  }
}
class TypeParameterAssignments {
  private _assignments: Map<string, TypeParameterAssignment> = new Map();
  constructor(
    typeParameters: TypeParameter[],
    ctx: Context,
    assignments?: Type[],
    parent?: TypeParameterAssignments,
  ) {
    typeParameters.forEach((p, i) => {
      if (assignments && parent && assignments[i]) {
        this._assignments.set(
          p.name,
          new TypeParameterAssignment(p, ctx, {
            type: assignments[i],
            assignments: parent,
          }),
        );
      } else {
        this._assignments.set(p.name, new TypeParameterAssignment(p, ctx));
      }
    });
  }
  getType(name: string): Type | null {
    const result = this._assignments.get(name);
    if (!result) {
      return null;
    }
    return result.getType();
  }
  tryToAssign(name: string, type: Type): boolean {
    const result = this._assignments.get(name);
    if (result) {
      return result.tryAssign(type);
    }
    return false;
  }
}
function fnMatches(
  args: Type[],
  fn: FunctionType,
  ctx: Context,
): false | TypeParameterAssignments {
  const assignment = new TypeParameterAssignments(fn.typeParameters, ctx);
  for (let i = 0; i < fn.params.length; i++) {
    if (fn.params[i].optional && (!args[i] || args[i].kind === TypeKind.Void)) {
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
function isSubType(
  child: Type,
  parent: Type,
  childTypeParams: TypeParameterAssignments | null,
  parentTypeParams: TypeParameterAssignments | null,
  ctx: Context,
): boolean {
  if (childTypeParams && child.kind === TypeKind.Reference) {
    // TODO: this should be some kind of reverse assignment
    if (childTypeParams.tryToAssign(child.name, parent)) {
      return true;
    }
  }
  switch (parent.kind) {
    case TypeKind.Any:
      return true;
    case TypeKind.Boolean:
      return (
        child.kind === TypeKind.Boolean ||
        child.kind === TypeKind.BooleanLiteral
      );
    case TypeKind.BooleanLiteral:
      return (
        child.kind === TypeKind.BooleanLiteral && child.value === parent.value
      );
    case TypeKind.Function:
      if (child.kind !== TypeKind.Function) {
        return false;
      }
      return (
        child.params.every((param, i) => {
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
            parent.params[i].type,
            param.type,
            parentTypeParams,
            childTypeParams,
            ctx,
          );
        }) &&
        isSubType(
          child.returnType,
          parent.returnType,
          childTypeParams,
          parentTypeParams,
          ctx,
        ) &&
        (!child.restParam ||
          !parent.restParam ||
          isSubType(
            // we swap child and parent for rest param
            parent.restParam.type,
            child.restParam.type,
            parentTypeParams,
            childTypeParams,
            ctx,
          ))
      );
    case TypeKind.GenericApplication: {
      if (parent.type.kind !== TypeKind.Reference) {
        return false;
      }
      const parentResolved = ctx.getResolvedTypeFromIdentifier(parent.type);
      if (!parentResolved) {
        return false;
      }
      if (
        parentResolved.kind !== TypeKind.Function &&
        parentResolved.kind !== TypeKind.Generic
      ) {
        throw new Error('Unsupported child kind for generic ' + child.kind);
      }
      return isSubType(
        child,
        parentResolved.kind === TypeKind.Generic
          ? parentResolved.type
          : parentResolved,
        childTypeParams,
        parentTypeParams &&
          new TypeParameterAssignments(
            parentResolved.typeParameters,
            ctx,
            parent.params,
            // TODO: is this nullable?
            parentTypeParams,
          ),
        ctx,
      );
    }
    case TypeKind.Null:
      return child.kind === TypeKind.Null;
    case TypeKind.Number:
      return (
        child.kind === TypeKind.Number || child.kind === TypeKind.NumericLiteral
      );
    case TypeKind.NumericLiteral:
      return (
        child.kind === TypeKind.NumericLiteral && child.value === parent.value
      );
    case TypeKind.Reference:
      if (
        parentTypeParams &&
        parentTypeParams.tryToAssign(parent.name, child)
      ) {
        return true;
      }
      const parentResolved = ctx.getResolvedTypeFromIdentifier(parent);
      if (!parentResolved) {
        return false;
      }
      return isSubType(child, parentResolved, childTypeParams, null, ctx);
    case TypeKind.String:
      return (
        child.kind === TypeKind.String || child.kind === TypeKind.StringLiteral
      );
    case TypeKind.StringLiteral:
      return (
        child.kind === TypeKind.StringLiteral && child.value === parent.value
      );
    case TypeKind.Union:
      return parent.types.some(type =>
        isSubType(child, type, childTypeParams, parentTypeParams, ctx),
      );
    case TypeKind.Void:
      return child.kind === TypeKind.Void;
    default:
      throw ctx.getError('Unsupported type ' + parent.kind, parent);
      return parent;
  }
}
function applyTypeParameterAssignment(
  type: Type,
  assignments: TypeParameterAssignments,
): Type {
  switch (type.kind) {
    case TypeKind.Any:
    case TypeKind.Boolean:
    case TypeKind.BooleanLiteral:
    case TypeKind.Null:
    case TypeKind.Number:
    case TypeKind.NumericLiteral:
    case TypeKind.String:
    case TypeKind.StringLiteral:
    case TypeKind.TypeOf:
    case TypeKind.Void:
      return type;

    case TypeKind.Function:
      return {
        kind: TypeKind.Function,
        params: type.params.map(p => ({
          ...p,
          type: applyTypeParameterAssignment(p.type, assignments),
        })),
        restParam: type.restParam && {
          ...type.restParam,
          type: applyTypeParameterAssignment(type.restParam.type, assignments),
        },
        returnType: applyTypeParameterAssignment(type.returnType, assignments),
        typeParameters: type.typeParameters,
        loc: type.loc,
      };
    case TypeKind.Generic:
      return type;
    case TypeKind.GenericApplication:
      return {
        kind: TypeKind.GenericApplication,
        type: type.type,
        params: type.params.map(t =>
          applyTypeParameterAssignment(t, assignments),
        ),
        loc: type.loc,
      };
    case TypeKind.Intersection:
      return {
        kind: TypeKind.Intersection,
        types: type.types.map(t =>
          applyTypeParameterAssignment(t, assignments),
        ),
        loc: type.loc,
      };
    case TypeKind.Object:
      return {
        kind: TypeKind.Object,
        exact: type.exact,
        properties: type.properties.map(p => ({
          ...p,
          type: applyTypeParameterAssignment(p.type, assignments),
        })),
        loc: type.loc,
      };
    case TypeKind.Reference:
      return assignments.getType(type.name) || type;
    case TypeKind.Tuple:
      return {
        kind: TypeKind.Tuple,
        types: type.types.map(t =>
          applyTypeParameterAssignment(t, assignments),
        ),
        loc: type.loc,
      };
    case TypeKind.Union:
      return unionTypes(
        type.loc,
        ...type.types.map(t => applyTypeParameterAssignment(t, assignments)),
      );
  }
}
