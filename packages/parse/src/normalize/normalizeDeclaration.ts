import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeFlowType from './normalizeFlowType';
import normalizeTSType from './normalizeTSType';
import normalizeTypeParameterDeclaration from './normalizeTypeParameterDeclaration';
import normalizeTSTypeParameterDeclaration from './normalizeTSTypeParameterDeclaration';

export default function normalizeDeclaration(
  input: bt.Declaration,
  ctx: ParseContext,
): ast.Declaration[] {
  switch (input.type) {
    case 'TypeAlias':
      return [
        ast.createTypeAliasDeclaration({
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
          id: normalizeIdentifier(input.id, ctx),
          type: normalizeFlowType(input.right, ctx),
          typeParameters: normalizeTypeParameterDeclaration(
            input.typeParameters,
            ctx,
          ),
        }),
      ];
    case 'TSTypeAliasDeclaration':
      return [
        ast.createTypeAliasDeclaration({
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
          id: normalizeIdentifier(input.id, ctx),
          type: normalizeTSType(input.typeAnnotation, ctx),
          typeParameters: normalizeTSTypeParameterDeclaration(
            input.typeParameters,
            ctx,
          ),
        }),
      ];
    default:
      return ctx.assertNever(input as never);
  }
}
