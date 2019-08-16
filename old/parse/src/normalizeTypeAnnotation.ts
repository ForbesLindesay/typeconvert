import * as bt from '@babel/types';
import WalkContext from './WalkContext';
import TypeAnnotation from './types/TypeAnnotation';
import TypeAnnotationKind from './types/TypeAnnotationKind';
import ExpressionKind from './types/ExpressionKind';
import FunctionParam from './types/FunctionParam';
import TypeParameter from './types/TypeParameter';
import Variance from './types/Variance';
import QualifiedTypeIdentifier from './types/TypeAnnotationTypes/QualifiedTypeIdentifier';
import Identifier from './types/ExpressionTypes/Identifier';
import ImportTypeAnnotation from './types/TypeAnnotationTypes/ImportTypeAnnotation';
import FunctionTypeAnnotation from './types/TypeAnnotationTypes/FunctionTypeAnnotation';
import ObjectTypeAnnotation, {
  ObjectTypeElementKind,
  ObjectTypeElement,
} from './types/TypeAnnotationTypes/ObjectTypeAnnotation';
import LiteralTypeAnnotation from './types/TypeAnnotationTypes/LiteralTypeAnnotation';
import TypeReferenceAnnotation from './types/TypeAnnotationTypes/TypeReferenceAnnotation';
import TypeIdentifier from './types/TypeAnnotationTypes/TypeIdentifier';

export default function normalizeTypeAnnotation(
  typeAnnotation: bt.TypeAnnotation | bt.TSTypeAnnotation,
  ctx: WalkContext,
): TypeAnnotation;
export default function normalizeTypeAnnotation(
  typeAnnotation:
    | bt.TypeAnnotation
    | bt.TSTypeAnnotation
    | bt.Noop
    | null
    | undefined,
  ctx: WalkContext,
): TypeAnnotation | undefined;
export default function normalizeTypeAnnotation(
  typeAnnotation:
    | bt.TypeAnnotation
    | bt.TSTypeAnnotation
    | bt.Noop
    | null
    | undefined,
  ctx: WalkContext,
): TypeAnnotation | undefined {
  if (!typeAnnotation || bt.isNoop(typeAnnotation)) {
    return undefined;
  }
  return normalizeType(typeAnnotation.typeAnnotation, ctx);
}

export function normalizeType(
  ta: bt.FlowType | bt.TSType,
  ctx: WalkContext,
): TypeAnnotation;
export function normalizeType(
  ta: bt.FlowType | bt.TSType | bt.Noop | null | undefined,
  ctx: WalkContext,
): TypeAnnotation | undefined;

export function normalizeType(
  ta: bt.FlowType | bt.TSType | bt.Noop | null | undefined,
  ctx: WalkContext,
): TypeAnnotation | undefined {
  if (!ta || bt.isNoop(ta)) {
    return undefined;
  }
  switch (ta.type) {
    case 'AnyTypeAnnotation':
    case 'TSAnyKeyword':
      return {kind: TypeAnnotationKind.AnyTypeAnnotation, loc: ta.loc};
    case 'ArrayTypeAnnotation':
    case 'TSArrayType': {
      return {
        kind: TypeAnnotationKind.ArrayTypeAnnotation,
        elementType: normalizeType(ta.elementType, ctx),
        loc: ta.loc,
      };
    }
    case 'BooleanTypeAnnotation':
    case 'TSBooleanKeyword':
      return {kind: TypeAnnotationKind.BooleanTypeAnnotation, loc: ta.loc};
    case 'BooleanLiteralTypeAnnotation':
    case 'NumberLiteralTypeAnnotation':
    case 'StringLiteralTypeAnnotation':
      return {
        kind: TypeAnnotationKind.LiteralTypeAnnotation,
        value: ta.value,
        loc: ta.loc,
      };
    case 'TSLiteralType':
      return {
        kind: TypeAnnotationKind.LiteralTypeAnnotation,
        value: ta.literal.value,
        loc: ta.loc,
      };
    case 'NullLiteralTypeAnnotation':
    case 'TSNullKeyword':
      return {
        kind: TypeAnnotationKind.LiteralTypeAnnotation,
        value: null,
        loc: ta.loc,
      };
    case 'VoidTypeAnnotation':
    // TODO: TypeScript void and undefined have some subtle differences
    // we may want to track these at some point in the future
    case 'TSVoidKeyword':
    case 'TSUndefinedKeyword':
      return {
        kind: TypeAnnotationKind.LiteralTypeAnnotation,
        value: undefined,
        loc: ta.loc,
      };
    case 'ExistsTypeAnnotation':
      return {kind: TypeAnnotationKind.ExistsTypeAnnotation, loc: ta.loc};
    case 'FunctionTypeAnnotation':
    case 'TSFunctionType':
    case 'TSConstructorType':
      return normalizeFunctionTypeAnnotation(ta, ctx);
    case 'GenericTypeAnnotation':
    case 'TSTypeReference': {
      return normalizeTypeReference(ta, ctx);
    }
    case 'IntersectionTypeAnnotation':
    case 'TSIntersectionType': {
      const types: ReadonlyArray<bt.FlowType | bt.TSType> = ta.types;
      return {
        kind: TypeAnnotationKind.IntersectionTypeAnnotation,
        types: types.map(t => normalizeType(t, ctx)),
        loc: ta.loc,
      };
    }
    case 'UnionTypeAnnotation':
    case 'TSUnionType': {
      const types: ReadonlyArray<bt.FlowType | bt.TSType> = ta.types;
      return {
        kind: TypeAnnotationKind.UnionTypeAnnotation,
        types: types.map(t => normalizeType(t, ctx)),
        loc: ta.loc,
      };
    }
    case 'MixedTypeAnnotation':
    case 'TSUnknownKeyword':
      return {kind: TypeAnnotationKind.UnknownTypeAnnotation, loc: ta.loc};
    case 'EmptyTypeAnnotation':
    case 'TSNeverKeyword':
      return {kind: TypeAnnotationKind.EmptyTypeAnnotation, loc: ta.loc};
    case 'NumberTypeAnnotation':
    case 'TSNumberKeyword':
      return {kind: TypeAnnotationKind.NumberTypeAnnotation, loc: ta.loc};
    case 'StringTypeAnnotation':
    case 'TSStringKeyword':
      return {kind: TypeAnnotationKind.StringTypeAnnotation, loc: ta.loc};
    case 'TupleTypeAnnotation':
      return {
        kind: TypeAnnotationKind.TupleTypeAnnotation,
        elements: ta.types.map(t => normalizeType(t, ctx)),
        restElement: undefined,
        loc: ta.loc,
      };
    case 'TSTupleType': {
      let elementTypes = ta.elementTypes;
      const lastElementType = elementTypes[elementTypes.length - 1];
      let restElement: TypeAnnotation | undefined = undefined;
      if (bt.isTSRestType(lastElementType)) {
        restElement = normalizeType(lastElementType.typeAnnotation, ctx);
        elementTypes = elementTypes.slice(0, elementTypes.length - 1);
      }
      return {
        kind: TypeAnnotationKind.TupleTypeAnnotation,
        elements: elementTypes.map(t => normalizeType(t, ctx)),
        restElement,
        loc: ta.loc,
      };
    }
    case 'ThisTypeAnnotation':
    case 'TSThisType': {
      return {kind: TypeAnnotationKind.ThisTypeAnnotation, loc: ta.loc};
    }
    case 'TSInferType': {
      if (!ta.typeParameter.name) {
        throw ctx.getError(
          `You must specify a name to infer a type parameter`,
          ta.typeParameter,
        );
      }
      return {
        kind: TypeAnnotationKind.InferTypeAnnotation,
        id: {
          kind: 'TypeIdentifier',
          name: ta.typeParameter.name,
          loc: ta.typeParameter.loc!,
        },
        loc: ta.loc,
      };
    }
    case 'NullableTypeAnnotation': {
      const baseType = normalizeType(ta.typeAnnotation, ctx);
      return {
        kind: TypeAnnotationKind.UnionTypeAnnotation,
        types: [
          baseType,
          {
            kind: TypeAnnotationKind.LiteralTypeAnnotation,
            value: null,
            loc: ta.loc,
          },
          {
            kind: TypeAnnotationKind.LiteralTypeAnnotation,
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
        kind: TypeAnnotationKind.UnionTypeAnnotation,
        types: [
          baseType,
          {
            kind: TypeAnnotationKind.LiteralTypeAnnotation,
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
      if (
        !bt.isGenericTypeAnnotation(ta.argument) ||
        (ta.argument.typeParameters && ta.argument.typeParameters.params.length)
      ) {
        throw ctx.getError(
          `typeof can only be used to get the type of variables or properties of variables`,
          ta.argument,
        );
      }
      return {
        kind: TypeAnnotationKind.TypeofTypeAnnotation,
        id: normalizeTypeIdentifier(ta.argument.id, ctx),
        loc: ta.loc,
      };
    case 'TSTypeQuery':
      return {
        kind: TypeAnnotationKind.TypeofTypeAnnotation,
        id: bt.isTSImportType(ta.exprName)
          ? normalizeTSImportType(ta.exprName, ctx)
          : normalizeTypeIdentifier(ta.exprName, ctx),
        loc: ta.loc,
      };
    case 'TSObjectKeyword':
      throw ctx.getError(
        `The "object" keyword is not supported. You should either use something more specific, such as \`{[key: string]: unknown}\` or the completely generic \`any\``,
        ta,
      );
    case 'TSRestType':
      throw ctx.getError(`Rest types are only supported inside tuples.`, ta);
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
      // e.g. type T = interface { p: string }
      throw ctx.getError('InterfaceTypeAnnotation not supported here', ta);
    }
    case 'TSTypeLiteral': {
      const properties: ObjectTypeElement[] = [];
      const callProperties: FunctionTypeAnnotation[] = [];
      ta.members.map(me => {
        switch (me.type) {
          case 'TSPropertySignature': {
            if (me.initializer) {
              throw ctx.getError(
                'initializers are not supported on type properties',
                me,
              );
            }
            properties.push({
              kind: ObjectTypeElementKind.ObjectTypeProperty,
              key: normalizeTsObjectKey(me.key, ctx),
              computed: !!(me.computed && !bt.isLiteral(me.key)),
              optional: me.optional || false,
              variance: me.readonly ? Variance.ReadOnly : Variance.ReadWrite,
              valueType: normalizeTypeAnnotation(me.typeAnnotation, ctx),
              mode: 'normal',
              proto: false,
              static: false,
            });
            break;
          }
          case 'TSConstructSignatureDeclaration':
          case 'TSCallSignatureDeclaration':
            callProperties.push(normalizeFunctionTypeAnnotation(me, ctx));
            break;
          case 'TSMethodSignature': {
            const tsFunctionType = bt.tsFunctionType(
              me.typeParameters,
              me.parameters,
              me.typeAnnotation,
            );
            tsFunctionType.loc = me.loc;

            properties.push({
              kind: ObjectTypeElementKind.ObjectTypeProperty,
              key: normalizeTsObjectKey(me.key, ctx),
              computed: !!(me.computed && !bt.isLiteral(me.key)),
              optional: me.optional || false,
              // in TS, all methods are bivariant (i.e. Read/Write)
              variance: Variance.ReadWrite,
              valueType: normalizeFunctionTypeAnnotation(tsFunctionType, ctx),
              mode: 'normal',
              proto: false,
              static: false,
            });
            break;
          }
          case 'TSIndexSignature': {
            if (me.parameters.length !== 1) {
              throw ctx.getError(
                'Expected exactly one parameter for indexer',
                me,
              );
            }
            const [parameter] = me.parameters;

            const keyType = normalizeTypeAnnotation(
              parameter.typeAnnotation,
              ctx,
            );
            const valueType = normalizeTypeAnnotation(me.typeAnnotation, ctx);

            if (!keyType) {
              throw ctx.getError('Expected type annotation', parameter);
            }
            if (!valueType) {
              throw ctx.getError('Expected type annotation', me);
            }
            properties.push({
              kind: ObjectTypeElementKind.ObjectTypeIndexer,
              id: normalizeTypeIdentifier(parameter, ctx),
              keyType,
              valueType,
              variance: me.readonly ? Variance.ReadOnly : Variance.ReadWrite,
              static: false,
            });
            break;
          }
          default:
            ctx.assertNever('Unsupported object type member', me);
        }
      });
      return {
        kind: TypeAnnotationKind.ObjectTypeAnnotation,
        properties,
        callProperties,
        exact: false,
        inexact: false,
        loc: ta.loc,
      };
    }
    case 'TSSymbolKeyword':
      return {
        kind: TypeAnnotationKind.SymbolTypeAnnotation,
        unique: false,
        loc: ta.loc,
      };
    case 'TSTypeOperator':
      if (ta.operator !== 'unique') {
        throw ctx.getError(`Unsupported type operator ${ta.operator}`, ta);
      }
      if (!bt.isTSSymbolKeyword(ta.typeAnnotation)) {
        throw ctx.getError(`Expected "symbol"`, ta.typeAnnotation);
      }
      return {
        kind: TypeAnnotationKind.SymbolTypeAnnotation,
        unique: true,
        loc: ta.loc,
      };
    // case 'TSTypePredicate':
    //   // x is y
    //   ta.parameterName;
    default:
      return ctx.assertNever(
        `Unsupported type annotation type ${(ta as any).type}`,
        ta,
      );
  }
}
function normalizeTypeReference(
  ta: bt.GenericTypeAnnotation | bt.InterfaceExtends | bt.TSTypeReference,
  ctx: WalkContext,
): TypeReferenceAnnotation {
  const idNode =
    bt.isGenericTypeAnnotation(ta) || bt.isInterfaceExtends(ta)
      ? ta.id
      : ta.typeName;
  const params: ReadonlyArray<bt.FlowType | bt.TSType> = ta.typeParameters
    ? ta.typeParameters.params
    : [];
  return {
    kind: TypeAnnotationKind.TypeReferenceAnnotation,
    id: normalizeTypeIdentifier(idNode, ctx),
    typeParameters: params.map(p => normalizeType(p, ctx)),
    loc: ta.loc,
  };
}

function normalizeFunctionTypeAnnotation(
  ta:
    | bt.FunctionTypeAnnotation
    | bt.TSFunctionType
    | bt.TSConstructorType
    | bt.TSCallSignatureDeclaration
    | bt.TSConstructSignatureDeclaration,
  ctx: WalkContext,
): FunctionTypeAnnotation {
  switch (ta.type) {
    case 'FunctionTypeAnnotation':
      return {
        kind: TypeAnnotationKind.FunctionTypeAnnotation,
        params: ta.params.map(p => normalizeFunctionTypeParam(p, ctx)),
        restParam: ta.rest
          ? normalizeFunctionTypeParam(ta.rest, ctx)
          : undefined,
        typeParams: (ta.typeParameters ? ta.typeParameters.params : []).map(p =>
          normalizeTypeParameter(p, ctx),
        ),
        returnType: normalizeType(ta.returnType, ctx),
        isConstructor: false,
        loc: ta.loc,
      };
    case 'TSFunctionType':
    case 'TSCallSignatureDeclaration':
    case 'TSConstructSignatureDeclaration':
    case 'TSConstructorType':
      const lastParam = ta.parameters[ta.parameters.length - 1];
      let restParam: bt.RestElement | undefined = undefined;
      let params = ta.parameters;
      if (bt.isRestElement(lastParam)) {
        restParam = lastParam;
        params = ta.parameters.slice(0, ta.parameters.length - 1);
      }
      return {
        kind: TypeAnnotationKind.FunctionTypeAnnotation,
        params: params.map(p => normalizeTsFunctionTypeParam(p, ctx)),
        restParam: restParam ? normalizeTsRestParam(restParam, ctx) : undefined,
        typeParams: (ta.typeParameters ? ta.typeParameters.params : []).map(p =>
          normalizeTypeParameter(p, ctx),
        ),
        returnType: normalizeTypeAnnotation(ta.typeAnnotation, ctx),
        isConstructor:
          bt.isTSConstructSignatureDeclaration(ta) ||
          bt.isTSConstructorType(ta),
        loc: ta.loc,
      };
    default:
      return ctx.assertNever('Expected function type', ta);
  }
}

function normalizeFunctionTypeParam(
  p: bt.FunctionTypeParam,
  ctx: WalkContext,
): FunctionParam {
  return {
    id: p.name ? normalizeIdentifier(p.name, ctx) : undefined,
    type: normalizeType(p.typeAnnotation, ctx),
    optional: p.optional || false,
    loc: p.loc!,
  };
}
function normalizeTsFunctionTypeParam(
  p: bt.Identifier | bt.RestElement,
  ctx: WalkContext,
): FunctionParam {
  if (bt.isRestElement(p)) {
    throw ctx.getError(
      'You can only have one rest element per function and it nust be the last parameter',
      p,
    );
  }
  return {
    id: normalizeIdentifier(p, ctx),
    type: normalizeTypeAnnotation(p.typeAnnotation, ctx),
    optional: p.optional || false,
    loc: p.loc!,
  };
}
function normalizeObjectTypeAnnotation(
  ta: bt.ObjectTypeAnnotation,
  ctx: WalkContext,
): ObjectTypeAnnotation {
  if (ta.internalSlots && ta.internalSlots.length) {
    throw ctx.getError(
      `TypeConvert does not support internal slots.`,
      ta.internalSlots[0],
    );
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
      throw ctx.getError(
        `Expected a function type but got ${cp.value.type}`,
        cp.value,
      );
    }
    return normalizeFunctionTypeAnnotation(cp.value, ctx);
  });
  // e.g. type T = { p: string }
  const objectPropertyKey = (
    k: bt.Identifier | bt.StringLiteral,
  ): TypeIdentifier | LiteralTypeAnnotation => {
    switch (k.type) {
      case 'Identifier':
        return {
          kind: 'TypeIdentifier',
          name: k.name,
          loc: k.loc,
        };
      case 'StringLiteral':
        return {
          kind: TypeAnnotationKind.LiteralTypeAnnotation,
          value: k.value,
          loc: ta.loc,
        };
      default:
        return ctx.assertNever(`Unrecognized key type`, k);
    }
  };
  const modeFromKind = (kind: 'init' | 'get' | 'set' | null) => {
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
    kind: TypeAnnotationKind.ObjectTypeAnnotation,
    properties: ta.properties
      .map((p): ObjectTypeElement => {
        switch (p.type) {
          case 'ObjectTypeProperty':
            return {
              kind: ObjectTypeElementKind.ObjectTypeProperty,
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
              kind: ObjectTypeElementKind.ObjectTypeSpreadProperty,
              argument: normalizeType(p.argument, ctx),
            };
          default:
            return ctx.assertNever(`Unexpected property type`, p);
        }
      })
      .concat(
        (ta.indexers || []).map((indexer): ObjectTypeElement => ({
          kind: ObjectTypeElementKind.ObjectTypeIndexer,
          id: indexer.id ? normalizeTypeIdentifier(indexer.id, ctx) : undefined,
          keyType: normalizeType(indexer.key, ctx),
          valueType: normalizeType(indexer.value, ctx),
          variance: normalizeVariance(indexer.variance, ctx),
          static: indexer.static || false,
        })),
      ),
    callProperties,
    exact: ta.exact,
    inexact: ta.inexact || false,
    loc: ta.loc,
  };
}
function normalizeTSImportType(
  ta: bt.TSImportType,
  ctx: WalkContext,
): ImportTypeAnnotation {
  return {
    kind: TypeAnnotationKind.ImportTypeAnnotation,
    relativePath: ta.argument.value,
    qualifier: ta.qualifier
      ? normalizeTypeIdentifier(ta.qualifier, ctx)
      : undefined,
    typeParameters: (ta.typeParameters ? ta.typeParameters.params : []).map(p =>
      normalizeType(p, ctx),
    ),
    loc: ta.loc,
  };
}
function normalizeTsRestParam(
  p: bt.RestElement,
  ctx: WalkContext,
): FunctionParam {
  return {
    id: bt.isIdentifier(p.argument)
      ? normalizeIdentifier(p.argument, ctx)
      : undefined,
    type: normalizeTypeAnnotation(p.typeAnnotation, ctx),
    optional: false,
    loc: p.loc!,
  };
}
function normalizeVariance(v: bt.Variance | null, ctx: WalkContext) {
  if (!v) {
    return Variance.ReadWrite;
  }
  switch (v.kind) {
    case 'plus':
      return Variance.ReadOnly;
    case 'minus':
      return Variance.WriteOnly;
    default:
      return ctx.assertNever(`Unsupported variance kind ${v.kind}`, v.kind);
  }
}
function normalizeTypeParameter(
  p: bt.TypeParameter | bt.TSTypeParameter,
  ctx: WalkContext,
): TypeParameter {
  const variance = normalizeVariance(
    bt.isTypeParameter(p) ? p.variance : null,
    ctx,
  );
  const bound = bt.isTypeParameter(p)
    ? normalizeTypeAnnotation(p.bound, ctx)
    : normalizeType(p.constraint, ctx);
  return {
    id: p.name ? {kind: 'TypeIdentifier', name: p.name, loc: p.loc} : undefined,
    bound,
    default: normalizeType(p.default, ctx),
    variance,
    loc: p.loc!,
  };
}

function normalizeIdentifier(id: bt.Identifier, ctx: WalkContext): Identifier {
  return {
    kind: ExpressionKind.Identifier,
    name: id.name,
    loc: id.loc,
  };
}

function normalizeTypeIdentifier(
  id: bt.Identifier,
  ctx: WalkContext,
): TypeIdentifier;
function normalizeTypeIdentifier(
  id: bt.Identifier | bt.QualifiedTypeIdentifier | bt.TSQualifiedName,
  ctx: WalkContext,
): TypeIdentifier | QualifiedTypeIdentifier;
function normalizeTypeIdentifier(
  id: bt.Identifier | bt.QualifiedTypeIdentifier | bt.TSQualifiedName,
  ctx: WalkContext,
): TypeIdentifier | QualifiedTypeIdentifier {
  if (bt.isIdentifier(id)) {
    return {kind: 'TypeIdentifier', name: id.name, loc: id.loc};
  }
  if (bt.isQualifiedTypeIdentifier(id)) {
    return {
      kind: 'QualifiedTypeIdentifier',
      qualifier: normalizeTypeIdentifier(id.qualification, ctx),
      property: normalizeTypeIdentifier(id.id, ctx),
    };
  }
  if (bt.isTSQualifiedName(id)) {
    return {
      kind: 'QualifiedTypeIdentifier',
      qualifier: normalizeTypeIdentifier(id.left, ctx),
      property: normalizeTypeIdentifier(id.right, ctx),
    };
  }
  return ctx.assertNever('Unsupported type identifier kind', id);
}

// TODO: doesn't makes sense for computed properties
function normalizeTsObjectKey(
  key: bt.Expression,
  ctx: WalkContext,
): TypeIdentifier | QualifiedTypeIdentifier | LiteralTypeAnnotation {
  switch (key.type) {
    case 'Identifier':
      return normalizeTypeIdentifier(key, ctx);
    case 'MemberExpression': {
      if (key.computed) {
        throw ctx.getError(
          'Computed properties are not supported in object literals',
          key,
        );
      }
      if (!bt.isIdentifier(key.property)) {
        throw ctx.getError('Expected key to be an identifier', key);
      }
      const object = normalizeTsObjectKey(key.object, ctx);
      if (
        object.kind !== 'TypeIdentifier' &&
        object.kind !== 'QualifiedTypeIdentifier'
      ) {
        throw ctx.getError('Unsupported object type ' + object.kind, key);
      }
      return {
        kind: 'QualifiedTypeIdentifier',
        qualifier: object,
        property: normalizeTypeIdentifier(key.property, ctx),
      };
    }
    case 'BooleanLiteral':
    case 'NumericLiteral':
    case 'StringLiteral':
      return {
        kind: TypeAnnotationKind.LiteralTypeAnnotation,
        value: key.value,
        loc: key.loc,
      };
    default:
      throw ctx.getError('Unsupported key type ' + key.type, key);
  }
}
