import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeFunctionParts from './normalizeFunctionParts';

export default function normalizeFunctionDeclaration(
  input: bt.FunctionDeclaration,
  ctx: ParseContext,
): ast.FunctionDeclaration {
  if (!input.id) {
    return ctx.throw(input, 'Expected FunctionDeclaration to have an ID');
  }

  return ast.createFunctionDeclaration({
    ...normalizeFunctionParts(input, ctx),
    id: normalizeIdentifier(input.id, ctx),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
