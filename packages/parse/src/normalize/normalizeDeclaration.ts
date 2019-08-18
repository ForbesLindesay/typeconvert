import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeType from './normalizeType';
import normalizeTypeParameterDeclaration from './normalizeTypeParameterDeclaration';
import normalizeFunctionDeclaration from './normalizeFunctionDeclaration';

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
          type: normalizeType(input.right, ctx),
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
          type: normalizeType(input.typeAnnotation, ctx),
          typeParameters: normalizeTypeParameterDeclaration(
            input.typeParameters,
            ctx,
          ),
        }),
      ];
    case 'FunctionDeclaration':
      return [normalizeFunctionDeclaration(input, ctx)];
    case 'TypeAlias':
      return [
        ast.createTypeAliasDeclaration({
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
          id: normalizeIdentifier(input.id, ctx),
          type: normalizeType(input.right, ctx),
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
          type: normalizeType(input.typeAnnotation, ctx),
          typeParameters: normalizeTypeParameterDeclaration(
            input.typeParameters,
            ctx,
          ),
        }),
      ];
    default:
      return ctx.assertNever(input as never);
  }
}
