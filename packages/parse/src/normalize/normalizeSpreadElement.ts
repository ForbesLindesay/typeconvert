import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import normalizeExpression from './normalizeExpression';
import ParseContext from '../ParseContext';

export default function normalizeSpreadElement(
  input: bt.SpreadElement,
  ctx: ParseContext,
): ast.SpreadElement {
  return ast.createSpreadElement({
    argument: normalizeExpression(input.argument, ctx),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
