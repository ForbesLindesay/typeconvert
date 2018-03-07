import {Declaration, Type, DeclarationKind, TypeKind} from '@typeconvert/types';
import Context from './Context';

function _getTypeFromDeclaration(declaration: Declaration, ctx: Context): Type {
  switch (declaration.kind) {
    case DeclarationKind.TypeAlias:
      if (declaration.typeParameters.length) {
        return {
          kind: TypeKind.Generic,
          type: declaration.right,
          typeParameters: declaration.typeParameters,
        };
      }
      return declaration.right;
    default:
      return declaration;
  }
}

export default function getTypeFromDeclaration(
  declaration: Declaration,
  ctx: Context,
): Type {
  const result = _getTypeFromDeclaration(declaration, ctx);
  if ((result as any) === declaration) {
    throw new Error('Unsupported type ' + declaration.kind);
  }
  return result;
}
