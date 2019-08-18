import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeIdentifier from './normalizeIdentifier';
import ParseContext from '../ParseContext';

export default function normalizePattern(
  input: bt.Pattern | bt.Identifier,
  ctx: ParseContext,
): ast.Pattern {
  switch (input.type) {
    case 'Identifier':
      return normalizeIdentifier(input, ctx);
    default:
      return ctx.assertNever(input as never);
  }
}
