import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';
import normalizeType from './normalizeType';
import normalizeIdentifier from './normalizeIdentifier';

export default function normalizeGenericTypeAnnotation(
  input: bt.GenericTypeAnnotation,
  ctx: ParseContext,
): ast.TypeAnnotation {
  if (bt.isIdentifier(input.id)) {
    const typeParameters = input.typeParameters
      ? input.typeParameters.params
      : [];
    switch (input.id.name) {
      case 'Array':
        if (typeParameters.length === 1) {
          return ast.createArrayTypeAnnotation({
            elementType: normalizeType(typeParameters[0], ctx),
            loc: input.loc,
            leadingComments: normalizeComments(input.leadingComments),
          });
        }
        break;
      case 'Object':
        if (typeParameters.length === 0) {
          return ast.createAnyObjectTypeAnnotation({
            loc: input.loc,
            leadingComments: normalizeComments(input.leadingComments),
          });
        }
        break;
    }
    if (typeParameters.length === 0) {
      return normalizeIdentifier(input.id, ctx);
    }
  }
  return ctx.assertNever(input as never);
}
