import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeFunctionTypeAnnotation from './normalizeFunctionTypeAnnotation';

export default function normalizeDeclareFunction(
  input: bt.DeclareFunction,
  ctx: ParseContext,
): ast.FunctionDeclaration {
  if (input.predicate) {
    return ctx.throw(input.predicate, 'predicates are not yet handled');
  }
  if (!bt.isTypeAnnotation(input.id.typeAnnotation)) {
    return ctx.throw(input.id, 'Expected Flow Type Annotation');
  }
  if (!bt.isFunctionTypeAnnotation(input.id.typeAnnotation.typeAnnotation)) {
    return ctx.throw(
      input.id.typeAnnotation,
      'Expected Function Type Annotation',
    );
  }
  const ta = normalizeFunctionTypeAnnotation(
    input.id.typeAnnotation.typeAnnotation,
    ctx,
  );
  return ast.createFunctionDeclaration({
    id: normalizeIdentifier(input.id, ctx),
    params: ta.params,
    typeParams: ta.typeParams,
    restParam: ta.restParam,
    returnType: ta.returnType,
    body: undefined,
    loc: input.loc,
    leadingComments: normalizeComments(
      input.leadingComments,
      input.id.leadingComments,
      input.id.typeAnnotation.leadingComments,
      input.id.typeAnnotation.typeAnnotation.leadingComments,
    ),
  });
}
