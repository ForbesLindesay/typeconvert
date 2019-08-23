import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeType from './normalizeType';
import normalizeTypeParameterDeclaration from './normalizeTypeParameterDeclaration';
import normalizeFunctionDeclaration from './normalizeFunctionDeclaration';
import normalizeDeclareFunction from './normalizeDeclareFunction';
import normalizeDeclareFunctionTS from './normalizeDeclareFunctionTS';

export default function normalizeDeclaration(
  input: bt.Declaration,
  ctx: ParseContext,
): ast.Declaration[] {
  switch (input.type) {
    case 'ImportDeclaration':
      //       specifiers: Array<
      //   ImportSpecifier | ImportDefaultSpecifier | ImportNamespaceSpecifier
      // >;
      // source: StringLiteral;
      // importKind: 'type' | 'typeof' | 'value' | null;
      return input.specifiers.map(
        (s): ast.ImportStatement => {
          switch (s.type) {
            case 'ImportSpecifier':
              return ast.createImportStatement({
                source: ast.createEsImportSource({
                  relativePath: input.source.value,
                  id: normalizeIdentifier(s.imported, ctx),
                  loc: s.loc,
                  leadingComments: normalizeComments(s.leadingComments),
                }),
                id: normalizeIdentifier(s.local, ctx),
                mode: s.importKind || input.importKind || undefined,
                loc: input.loc,
                leadingComments: normalizeComments(input.leadingComments),
              });
            case 'ImportDefaultSpecifier':
              return ast.createImportStatement({
                source: ast.createEsImportSource({
                  relativePath: input.source.value,
                  id: ast.createIdentifier({
                    name: 'default',
                    leadingComments: [],
                    loc: s.loc,
                  }),
                  loc: s.loc,
                  leadingComments: normalizeComments(s.leadingComments),
                }),
                id: normalizeIdentifier(s.local, ctx),
                mode: input.importKind || undefined,
                loc: input.loc,
                leadingComments: normalizeComments(input.leadingComments),
              });
            case 'ImportNamespaceSpecifier':
              return ast.createImportStatement({
                source: ast.createNamespaceImportSource({
                  relativePath: input.source.value,
                  loc: s.loc,
                  leadingComments: normalizeComments(s.leadingComments),
                }),
                id: normalizeIdentifier(s.local, ctx),
                mode: input.importKind || undefined,
                loc: input.loc,
                leadingComments: normalizeComments(input.leadingComments),
              });
            default:
              return ctx.assertNever(s as never);
          }
        },
      );
      break;
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
    case 'DeclareFunction':
      return [normalizeDeclareFunction(input, ctx)];
    case 'TSDeclareFunction':
      return [normalizeDeclareFunctionTS(input, ctx)];
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
