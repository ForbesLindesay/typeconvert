import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';
import normalizeIdentifier from './normalizeIdentifier';

export default function normalizeTypeIdentifier(
  input: bt.TSEntityName | bt.QualifiedTypeIdentifier | bt.Identifier,
  ctx: ParseContext,
): ast.QualifiedTypeIdentifier | ast.Identifier {
  return bt.isQualifiedTypeIdentifier(input)
    ? ast.createQualifiedTypeIdentifier({
        qualifier: normalizeTypeIdentifier(input.qualification, ctx),
        property: normalizeIdentifier(input.id, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      })
    : bt.isTSQualifiedName(input)
    ? ast.createQualifiedTypeIdentifier({
        qualifier: normalizeTypeIdentifier(input.left, ctx),
        property: normalizeIdentifier(input.right, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      })
    : normalizeIdentifier(input, ctx);
}
