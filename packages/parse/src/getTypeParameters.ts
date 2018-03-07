import * as bt from '@babel/types';
import {TypeParameter, Variance} from '@typeconvert/types';
import Context from './Context';

export default function getTypeParameters(
  typeParameters:
    | bt.TypeParameterDeclaration
    | bt.TSTypeParameterDeclaration
    | bt.Noop
    | null,
  ctx: Context,
) {
  if (!typeParameters || bt.isNoop(typeParameters)) {
    return [];
  }
  if (bt.isTypeParameterDeclaration(typeParameters)) {
    return typeParameters.params.map((p): TypeParameter => {
      if (!p.name) {
        throw ctx.getError('Cannot have a type parameter without a name', p);
      }
      if (p.bound) {
        throw ctx.getError('Bound type parameters not supported yet', p);
      }
      return {
        name: p.name,
        variance:
          p.variance && p.variance.kind === 'plus'
            ? Variance.covariant
            : p.variance && p.variance.kind === 'minus'
              ? Variance.contravariant
              : Variance.invariant,
      };
    });
  }
  // TSTypeParameterDeclaration
  return typeParameters.params.map((p: bt.TSTypeParameter): TypeParameter => {
    if (!p.name) {
      throw ctx.getError('Cannot have a type parameter without a name', p);
    }
    return {
      name: p.name,
      variance: Variance.invariant,
    };
  });
}
