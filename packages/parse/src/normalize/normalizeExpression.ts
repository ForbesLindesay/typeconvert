import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeArrayExpression from './normalizeArrayExpression';
import normalizeIdentifier from './normalizeIdentifier';
import ParseContext from '../ParseContext';

export default function normalizeExpression(
  input: bt.Expression,
  ctx: ParseContext,
): ast.Expression {
  switch (input.type) {
    case 'ArrayExpression':
      return normalizeArrayExpression(input, ctx);
    case 'Identifier':
      return normalizeIdentifier(input, ctx);
    default:
      return ctx.assertNever(input as never);
  }
}
