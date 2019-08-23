import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeExpression from './normalizeExpression';

export default function normalizeUnaryExpression(
  input: bt.UnaryExpression,
  ctx: ParseContext,
): ast.UnaryExpression {
  if (!input.prefix) {
    return ctx.throw(input, 'Expected unary operation to be prefix');
  }
  return ast.createUnaryExpression({
    argument: normalizeExpression(input.argument, ctx),
    operator: input.operator,
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
