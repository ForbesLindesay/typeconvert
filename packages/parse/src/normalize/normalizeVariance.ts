import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';

export default function normalizeVariance(
  input: bt.Variance | null,
  ctx: ParseContext,
): ast.Variance {
  if (!input) return ast.Variance.ReadWrite;
  if (input.kind === 'minus') return ast.Variance.WriteOnly;
  if (input.kind === 'plus') return ast.Variance.ReadOnly;
  return ctx.assertNever(input.kind);
}
