import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';
import normalizePattern from './normalizePattern';

// Identifier | RestElement | ArrayPattern | ObjectPattern | TSParameterProperty
export default function normalizeFunctionParam(
  input: bt.Identifier | bt.Pattern | bt.TSParameterProperty,
  ctx: ParseContext,
): ast.FunctionParameter {
  if (bt.isTSParameterProperty(input)) {
    // TODO: add support for TS Parameter Properties
    return ctx.throw(input, 'TS parameter properties are not yet supported');
  }
  return ast.createFunctionParameter({
    name: normalizePattern(input, ctx),
    type:
      normalizeType(input.typeAnnotation, ctx) ||
      (bt.isAssignmentPattern(input)
        ? normalizeType(input.left.typeAnnotation, ctx)
        : undefined),
    // TODO: handle optional TS Parameter Properties
    optional: bt.isIdentifier(input) ? input.optional || false : false,
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
