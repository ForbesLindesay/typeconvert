import {Declaration, Type} from '@typeconvert/types';
import Context from './Context';

function _getTypeOfDeclarationValue(
  declaration: Declaration,
  ctx: Context,
): Type {
  switch (declaration.kind) {
    default:
      return declaration;
  }
}

export default function getTypeOfDeclarationValue(
  declaration: Declaration,
  ctx: Context,
): Type {
  const result = _getTypeOfDeclarationValue(declaration, ctx);
  if ((result as any) === declaration) {
    throw new Error('Unsupported type ' + declaration.kind);
  }
  return result;
}
