import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeArrayExpression from './normalizeArrayExpression';
import normalizeIdentifier from './normalizeIdentifier';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';

export default function normalizeExpression(
  input: bt.Expression,
  ctx: ParseContext,
): ast.Expression {
  switch (input.type) {
    case 'ArrayExpression':
      return normalizeArrayExpression(input, ctx);
    case 'Identifier':
      return normalizeIdentifier(input, ctx);
    case 'LogicalExpression':
      return ast.createLogicalExpression({
        left: normalizeExpression(input.left, ctx),
        right: normalizeExpression(input.right, ctx),
        operator: input.operator,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    case 'BinaryExpression':
      return ast.createBinaryExpression({
        left: normalizeExpression(input.left, ctx),
        right: normalizeExpression(input.right, ctx),
        operator: input.operator,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    default:
      return ctx.assertNever(input as never);
  }
}
