import * as bt from '@babel/types';
import {
  FunctionParam,
  ObjectProperty,
  Type,
  TypeKind,
  TypeReference,
  Variance,
  SourceLocation,
  TypeReferenceKind,
  FunctionType,
} from '@typeconvert/types';
import {InferScopeContext} from './InferContext';
import unionTypes from './unionTypes';
import getTypeParameters from './getTypeParameters';
import Waitable, {DeeperWaitable} from '../utils/Waitable';
import intersectTypes from './intersectTypes';

/**
 * Convert a bable type into our internal `TypeReference`
 * representation.
 */
export default function getTypeOfBabelTypeUncached(
  babelType: bt.FlowType | bt.TSType,
  ctx: InferScopeContext,
): DeeperWaitable<TypeReference> {
  const loc = babelType.loc && new SourceLocation(babelType.loc);
  switch (babelType.type) {
    case 'AnyTypeAnnotation':
      return rawType({kind: TypeKind.Any, loc});
    case 'BooleanLiteralTypeAnnotation':
      if (typeof babelType.value !== 'boolean') {
        throw ctx.getError(
          'Expected boolean literal to have boolean value',
          babelType,
        );
      }
      return rawType({
        kind: TypeKind.BooleanLiteral,
        value: babelType.value,
        loc,
      });
    case 'BooleanTypeAnnotation':
      return rawType({kind: TypeKind.Boolean, loc});
    case 'FunctionTypeAnnotation':
      return rawType({
        kind: TypeKind.Function,
        params: babelType.params.map((param): DeeperWaitable<FunctionParam> => {
          return {
            name: param.name ? param.name.name : undefined,
            type: ctx.getTypeOfBabelType(param.typeAnnotation),
            optional: param.optional || false,
          };
        }),
        typeParameters: getTypeParameters(babelType.typeParameters, ctx),
        restParam: babelType.rest
          ? {
              name: babelType.rest.name ? babelType.rest.name.name : undefined,
              type: ctx.getTypeOfBabelType(babelType.rest.typeAnnotation),
              optional: false,
            }
          : undefined,
        returnType: ctx.getTypeOfBabelType(babelType.returnType),
        loc,
      });
    case 'GenericTypeAnnotation': {
      if (babelType.typeParameters) {
        const reference = ctx.programContext.getTypeFromIdentifier(
          babelType.id,
          ctx.scope,
        );
        return rawType({
          kind: TypeKind.GenericApplication,
          type: reference,
          params: babelType.typeParameters.params.map(p =>
            ctx.getTypeOfBabelType(p),
          ),
          loc,
        });
      }
      return Waitable.resolve(
        ctx.programContext.getTypeFromIdentifier(babelType.id, ctx.scope),
      );
    }
    case 'IntersectionTypeAnnotation':
      return intersectTypes(
        loc,
        ctx,
        ...babelType.types.map(bt => ctx.getTypeOfBabelType(bt)),
      );
    case 'NullableTypeAnnotation': {
      return unionTypes(
        loc,
        ctx,
        rawType({kind: TypeKind.Null, loc}),
        rawType({kind: TypeKind.Void, loc}),
        ctx.getTypeOfBabelType(babelType.typeAnnotation),
      );
    }
    case 'NullLiteralTypeAnnotation':
      return rawType({kind: TypeKind.Null, loc});
    case 'TSNumberKeyword':
    case 'NumberTypeAnnotation':
      return rawType({kind: TypeKind.Number, loc});
    case 'ObjectTypeAnnotation':
      if (babelType.indexers && babelType.indexers.length) {
        throw ctx.assertNever(
          'indexers and call properties are not supported',
          babelType,
        );
      }
      const properties: DeeperWaitable<ObjectProperty>[] = [];
      for (let prop of babelType.properties) {
        if (prop.type === 'ObjectTypeSpreadProperty') {
          const typeRef = ctx.getTypeOfBabelType(prop.argument).getValue();
          ctx.assertNever('Object spread property', typeRef);
        } else {
          if (prop.kind !== 'init') {
            throw ctx.getError(`Invalid property kind ${prop.kind}`, prop);
          }
          const name = bt.isStringLiteral(prop.key)
            ? prop.key.value
            : bt.isIdentifier(prop.key)
              ? prop.key.name
              : ctx.assertNever('Unsupported property type', prop.key);
          properties.push({
            name,
            optional: prop.optional || false,
            type: ctx.getTypeOfBabelType(prop.value),
            variance:
              prop.variance && prop.variance.kind === 'minus'
                ? Variance.contravariant
                : prop.variance && prop.variance.kind === 'plus'
                  ? Variance.covariant
                  : Variance.invariant,
            loc,
          });
        }
      }
      const callProperties: DeeperWaitable<FunctionType>[] = [];
      for (const prop of babelType.callProperties || []) {
        const typeRef = ctx.getTypeOfBabelType(prop.value).getValue();
        if (typeRef.kind !== TypeReferenceKind.RawType) {
          throw ctx.getError(
            `Expected raw function type but got ${typeRef.kind}.`,
            prop,
          );
        }
        const type = Waitable.resolve(typeRef.type);
        if (type.kind !== TypeKind.Function) {
          throw ctx.getError(
            `Expected function type but got ${type.kind}.`,
            prop,
          );
        }
        callProperties.push(type);
      }
      return rawType({
        kind: TypeKind.Object,
        exact: babelType.exact || false,
        properties,
        callProperties,
        loc,
      });
    case 'StringLiteralTypeAnnotation':
      if (babelType.value == null) {
        throw ctx.getError(
          'Missing value for string literal type annotation',
          babelType,
        );
      }
      return rawType({
        kind: TypeKind.StringLiteral,
        value: babelType.value,
        loc,
      });
    case 'StringTypeAnnotation':
      return rawType({kind: TypeKind.String, loc});
    case 'TupleTypeAnnotation':
      return rawType({
        kind: TypeKind.Tuple,
        types: babelType.types.map(bt => ctx.getTypeOfBabelType(bt)),
        loc,
      });
    case 'TypeofTypeAnnotation':
      // TODO: this feels very wrong
      return Waitable.resolve(ctx.getTypeOfBabelType(babelType.argument));
    case 'UnionTypeAnnotation':
      return unionTypes(
        loc,
        ctx,
        ...babelType.types.map(bt => ctx.getTypeOfBabelType(bt)),
      );
    case 'TSVoidKeyword':
    case 'VoidTypeAnnotation':
      return rawType({kind: TypeKind.Void, loc});
    default:
      return ctx.assertNever('Unsupported bable type', babelType);
  }
}

function rawType(type: DeeperWaitable<Type>): DeeperWaitable<TypeReference> {
  return {
    kind: TypeReferenceKind.RawType,
    loc: type.loc,
    type,
  };
}
