import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';

export default function normalizeIdentifier(
  input: bt.Identifier,
  ctx: ParseContext,
): ast.Identifier {
  return ast.createIdentifier({
    name: input.name,
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
