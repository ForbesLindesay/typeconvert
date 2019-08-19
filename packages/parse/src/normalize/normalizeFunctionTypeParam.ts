import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';
import normalizeIdentifier from './normalizeIdentifier';

export default function normalizeFunctionTypeParam(
  input: bt.FunctionTypeParam,
  ctx: ParseContext,
): ast.FunctionParameter {
  return ast.createFunctionParameter({
    name: input.name ? normalizeIdentifier(input.name, ctx) : undefined,
    type: normalizeType(input.typeAnnotation, ctx),
    optional: input.optional || false,
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
