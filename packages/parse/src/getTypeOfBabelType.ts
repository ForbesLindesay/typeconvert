import * as bt from '@babel/types';
import {ObjectProperty, Type, TypeKind, Variance} from '@typeconvert/types';
import Context from './Context';

function _getTypeOfBabelType(
  babelType: bt.FlowType | bt.TSType,
  ctx: Context,
): Type {
  switch (babelType.type) {
    case 'AnyTypeAnnotation':
      return {kind: TypeKind.Any};
    case 'GenericTypeAnnotation': {
      ctx.useIdentifierInExport(babelType.id.name);
      const reference: Type = ctx.getTypeFromIdentifier(babelType.id.name);
      if (babelType.typeParameters) {
        return babelType;
      }
      return reference;
    }
    case 'TSNumberKeyword':
    case 'NumberTypeAnnotation':
      return {kind: TypeKind.Number};
    case 'ObjectTypeAnnotation':
      if (
        (babelType.indexers && babelType.indexers.length) ||
        (babelType.callProperties && babelType.callProperties.length) ||
        babelType.exact
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
        properties,
      };
    case 'StringTypeAnnotation':
      return {kind: TypeKind.String};
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
