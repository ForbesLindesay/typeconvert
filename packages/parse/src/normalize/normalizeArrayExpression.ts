import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import normalizeSpreadElement from './normalizeSpreadElement';
import normalizeExpression from './normalizeExpression';
import ParseContext from '../ParseContext';

export default function normalizeArrayExpression(
  input: bt.ArrayExpression,
  ctx: ParseContext,
): ast.ArrayExpression {
  return ast.createArrayExpression({
    elements: input.elements.map(e =>
      e === null
        ? e
        : e.type === 'SpreadElement'
        ? normalizeSpreadElement(e, ctx)
        : normalizeExpression(e, ctx),
    ),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
