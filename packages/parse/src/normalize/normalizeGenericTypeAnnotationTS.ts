import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';
import normalizeType from './normalizeType';
import normalizeTypeIdentifier from './normalizeTypeIdentifier';

export default function normalizeGenericTypeAnnotationTS(
  input: bt.TSTypeReference,
  ctx: ParseContext,
): ast.TypeAnnotation {
  const typeParameters = input.typeParameters
    ? input.typeParameters.params
    : [];

  if (bt.isIdentifier(input.typeName)) {
    switch (input.typeName.name) {
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
  }
  if (typeParameters.length === 0) {
    const result = normalizeTypeIdentifier(input.typeName, ctx);
    return {
      ...result,
      leadingComments: normalizeComments(input.leadingComments).concat(
        result.leadingComments,
      ),
    };
  } else {
    return ast.createGenericTypeAnnotation({
      type: normalizeTypeIdentifier(input.typeName, ctx),
      typeArguments: typeParameters.map(t => normalizeType(t, ctx)),
      loc: input.loc,
      leadingComments: normalizeComments(input.leadingComments),
    });
  }
}
