import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import normalizeExpression from './normalizeExpression';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeFlowType from './normalizeFlowType';
import normalizeTSType from './normalizeTSType';
import normalizeTypeParameterDeclaration from './normalizeTypeParameterDeclaration';
import normalizeTSTypeParameterDeclaration from './normalizeTSTypeParameterDeclaration';

export default function normalizeStatement(
  input: bt.Statement,
  ctx: ParseContext,
): ast.Statement[] {
  switch (input.type) {
    case 'ExpressionStatement':
      return [
        ast.createExpressionStatement({
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
          expression: normalizeExpression(input.expression, ctx),
        }),
      ];
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
