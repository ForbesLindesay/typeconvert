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
  const typeParameters = input.typeParameters
    ? input.typeParameters.params
    : [];
  if (bt.isIdentifier(input.id)) {
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
  }
  if (typeParameters.length === 0) {
    const result = normalizeTypeIdentifier(input.id, ctx);
    return {
      ...result,
      leadingComments: normalizeComments(input.leadingComments).concat(
        result.leadingComments,
      ),
    };
  } else {
    return ast.createGenericTypeAnnotation({
      type: normalizeTypeIdentifier(input.id, ctx),
      typeArguments: typeParameters.map(t => normalizeType(t, ctx)),
      loc: input.loc,
      leadingComments: normalizeComments(input.leadingComments),
    });
  }
}
function normalizeTypeIdentifier(
  input: bt.QualifiedTypeIdentifier | bt.Identifier,
  ctx: ParseContext,
): ast.QualifiedTypeIdentifier | ast.Identifier {
  return bt.isQualifiedTypeIdentifier(input)
    ? ast.createQualifiedTypeIdentifier({
        qualifier: normalizeTypeIdentifier(input.qualification, ctx),
        property: normalizeIdentifier(input.id, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      })
    : normalizeIdentifier(input, ctx);
}
