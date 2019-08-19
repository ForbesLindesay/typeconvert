import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';

export default function normalizeTypeParameterInstantiation(
  input: bt.TypeParameterInstantiation | bt.TSTypeParameterInstantiation | null,
  ctx: ParseContext,
): ast.TypeAnnotation[] {
  if (!input) return [];
  if (!input.params.length) return [];

  if (bt.isTSTypeParameterInstantiation(input)) {
    return input.params.map(p => normalizeType(p, ctx));
  }
  return input.params.map(p => normalizeType(p, ctx));
}
