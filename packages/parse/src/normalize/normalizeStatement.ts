import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import normalizeExpression from './normalizeExpression';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeDeclaration from './normalizeDeclaration';

export default function normalizeStatement(
  input: bt.Statement,
  ctx: ParseContext,
): ast.Statement[] {
  switch (input.type) {
    case 'ExportDefaultDeclaration':
      if (bt.isExpression(input.declaration)) {
        return [
          ast.createExportDefault({
            expression: normalizeExpression(input.declaration, ctx),
            loc: input.loc,
            leadingComments: normalizeComments(input.leadingComments),
          }),
        ];
      } else {
        const declarations = normalizeDeclaration(input.declaration, ctx);
        if (declarations.length !== 1) {
          return ctx.throw(input, 'Expected exactly one declaration');
        }
        return [
          {
            ...declarations[0],
            leadingComments: normalizeComments(input.leadingComments).concat(
              declarations[0].leadingComments,
            ),
          },
          ast.createExportDefault({
            expression: declarations[0].id,
            loc: input.loc,
            leadingComments: [],
          }),
        ];
      }
    case 'ExportNamedDeclaration':
      const result: ast.Statement[] = [];
      if (input.declaration) {
        const declarations = normalizeDeclaration(input.declaration, ctx);
        for (const d of declarations) {
          result.push({
            ...d,
            leadingComments: normalizeComments(input.leadingComments).concat(
              d.leadingComments,
            ),
          });
          result.push(
            ast.createExportNamed({
              localName: d.id,
              exportedName: d.id,
              loc: input.loc,
              leadingComments: [],
            }),
          );
        }
      }
      for (const specifier of input.specifiers) {
        switch (specifier.type) {
          case 'ExportSpecifier':
            result.push(
              ast.createExportNamed({
                localName: normalizeIdentifier(specifier.local, ctx),
                exportedName: normalizeIdentifier(specifier.exported, ctx),
                loc: specifier.loc,
                leadingComments: normalizeComments(
                  input.leadingComments,
                  specifier.leadingComments,
                ),
              }),
            );
            break;
          default:
            return ctx.assertNever(specifier as never);
        }
      }
      return result;
    case 'ExpressionStatement':
      return [
        ast.createExpressionStatement({
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
          expression: normalizeExpression(input.expression, ctx),
        }),
      ];
    case 'IfStatement':
      return [
        ast.createIfStatement({
          test: normalizeExpression(input.test, ctx),
          consequent: normalizeStatement(input.consequent, ctx),
          alternate: input.alternate
            ? normalizeStatement(input.alternate, ctx)
            : [],
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
        }),
      ];
    case 'ReturnStatement':
      return [
        ast.createReturnStatement({
          argument: input.argument
            ? normalizeExpression(input.argument, ctx)
            : ast.createIdentifier({
                name: 'undefined',
                loc: input.loc,
                leadingComments: [],
              }),
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
        }),
      ];
    case 'BlockStatement':
      return input.body
        .map(s => normalizeStatement(s, ctx))
        .reduce((a, b) => [...a, ...b], []);
    default:
      if (bt.isDeclaration(input)) {
        return normalizeDeclaration(input, ctx);
      }
      return ctx.assertNever(input as never);
  }
}
