import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeFunctionParts from './normalizeFunctionParts';

export default function normalizeFunctionExpression(
  input: bt.FunctionExpression | bt.ArrowFunctionExpression,
  ctx: ParseContext,
): ast.FunctionExpression {
  return ast.createFunctionExpression({
    ...normalizeFunctionParts(input, ctx),
    id:
      bt.isFunctionExpression(input) && input.id
        ? normalizeIdentifier(input.id, ctx)
        : undefined,
    isArrowFunction: bt.isArrowFunctionExpression(input),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
