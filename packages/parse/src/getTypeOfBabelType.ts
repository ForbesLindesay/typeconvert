import * as bt from '@babel/types';
import {
  FunctionParam,
  ObjectProperty,
  Type,
  TypeKind,
  Variance,
} from '@typeconvert/types';
import Context from './Context';
import mergeTypes from './mergeTypes';

function _getTypeOfBabelType(
  babelType: bt.FlowType | bt.TSType,
  ctx: Context,
): Type {
  switch (babelType.type) {
    case 'AnyTypeAnnotation':
      return {kind: TypeKind.Any};
    case 'BooleanTypeAnnotation':
      return {kind: TypeKind.Boolean};
    case 'FunctionTypeAnnotation':
      return {
        kind: TypeKind.Function,
        params: babelType.params.map((param): FunctionParam => {
          return {
            name: param.name ? param.name.name : undefined,
            type: getTypeOfBabelType(param.typeAnnotation, ctx),
          };
        }),
        restParam: babelType.rest
          ? {
              name: babelType.rest.name ? babelType.rest.name.name : undefined,
              type: getTypeOfBabelType(babelType.rest.typeAnnotation, ctx),
            }
          : undefined,
        returnType: getTypeOfBabelType(babelType.returnType, ctx),
      };
    case 'GenericTypeAnnotation': {
      ctx.useIdentifierInExport(babelType.id.name);
      const reference: Type = ctx.getTypeFromIdentifier(babelType.id.name);
      if (babelType.typeParameters) {
        return {
          kind: TypeKind.GenericApplication,
          type: reference,
          params: babelType.typeParameters.params.map(p =>
            getTypeOfBabelType(p, ctx),
          ),
        };
      }
      return reference;
    }
    case 'IntersectionTypeAnnotation':
      return {
        kind: TypeKind.Intersection,
        types: babelType.types.map(bt => getTypeOfBabelType(bt, ctx)),
      };
    case 'NullableTypeAnnotation': {
      return mergeTypes(
        {kind: TypeKind.Null},
        {kind: TypeKind.Void},
        getTypeOfBabelType(babelType.typeAnnotation, ctx),
      );
    }
    case 'NullLiteralTypeAnnotation':
      return {kind: TypeKind.Null};
    case 'TSNumberKeyword':
    case 'NumberTypeAnnotation':
      return {kind: TypeKind.Number};
    case 'ObjectTypeAnnotation':
      if (
        (babelType.indexers && babelType.indexers.length) ||
        (babelType.callProperties && babelType.callProperties.length)
      ) {
        return babelType;
      }
      const properties: ObjectProperty[] = [];
      for (let prop of babelType.properties) {
        if (prop.type === 'ObjectTypeSpreadProperty') {
          babelType;
        } else {
          properties.push({
            name: prop.key.name,
            optional: prop.optional || false,
            type: getTypeOfBabelType(prop.value, ctx),
            variance:
              prop.variance && prop.variance.kind === 'minus'
                ? Variance.contravariant
                : prop.variance && prop.variance.kind === 'plus'
                  ? Variance.covariant
                  : Variance.invariant,
          });
        }
      }
      return {
        kind: TypeKind.Object,
        exact: babelType.exact || false,
        properties,
      };
    case 'StringLiteralTypeAnnotation':
      if (babelType.value == null) {
        throw ctx.getError(
          'Missing value for string literal type annotation',
          babelType,
        );
      }
      return {kind: TypeKind.StringLiteral, value: babelType.value};
    case 'StringTypeAnnotation':
      return {kind: TypeKind.String};
    case 'TupleTypeAnnotation':
      return {
        kind: TypeKind.Tuple,
        types: babelType.types.map(bt => getTypeOfBabelType(bt, ctx)),
      };
    case 'TypeofTypeAnnotation':
      return getTypeOfBabelType(babelType.argument, ctx);
    case 'UnionTypeAnnotation':
      return mergeTypes(
        ...babelType.types.map(bt => getTypeOfBabelType(bt, ctx)),
      );
    case 'VoidTypeAnnotation':
      return {kind: TypeKind.Void};
    default:
      return babelType;
  }
}
export default function getTypeOfBabelType(
  babelType: bt.FlowType | bt.TSType,
  ctx: Context,
): Type {
  const result = _getTypeOfBabelType(babelType, ctx);
  if ((result as any) === babelType) {
    throw ctx.getError('Unsupported type ' + babelType.type, babelType);
  }
  return result;
}
