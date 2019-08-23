import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import normalizeExpression from './normalizeExpression';
import ParseContext from '../ParseContext';

export default function normalizeTemplateLiteral(
  input: bt.TemplateLiteral,
  ctx: ParseContext,
): ast.TemplateLiteral {
  return ast.createTemplateLiteral({
    expressions: input.expressions.map(e => normalizeExpression(e, ctx)),
    quasis: input.quasis.map(q =>
      ast.createTemplateElement({
        rawValue: q.value.raw,
        cookedValue: q.value.cooked,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      }),
    ),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
