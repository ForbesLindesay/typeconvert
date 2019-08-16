import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';

export default function normalizeTSType(
  input: bt.TSType,
  ctx: ParseContext,
): ast.TypeAnnotation {
  switch (input.type) {
    default:
      return ctx.assertNever(input as never);
  }
}
