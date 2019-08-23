import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import normalizeExpression from './normalizeExpression';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';

export default function normalizeObjectExpression(
  input: bt.ObjectExpression,
  ctx: ParseContext,
): ast.ObjectExpression {
  return ast.createObjectExpression({
    properties: input.properties.map(p =>
      normalizeObjectExpressionElement(p, ctx),
    ),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
function normalizeObjectExpressionElement(
  input: bt.ObjectMethod | bt.ObjectProperty | bt.SpreadElement,
  ctx: ParseContext,
): ast.ObjectExpressionElement {
  switch (input.type) {
    case 'ObjectProperty':
      if (!bt.isExpression(input.value)) {
        return ctx.throw(input.value, 'Expected an expression');
      }
      if (input.computed) {
        return ast.createObjectExpressionComputedProperty({
          key: normalizeExpression(input.key, ctx),
          value: normalizeExpression(input.value, ctx),
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
        });
      }
      if (!bt.isIdentifier(input.key) && !bt.isStringLiteral(input.key)) {
        return ctx.throw(input.key, 'Expected an identifier');
      }
      return ast.createObjectExpressionProperty({
        key: bt.isStringLiteral(input.key)
          ? ast.createStringLiteral({
              value: input.key.value,
              loc: input.key.loc,
              leadingComments: normalizeComments(input.key.leadingComments),
            })
          : bt.isNumericLiteral(input.key)
          ? ast.createNumericLiteral({
              value: input.key.value,
              loc: input.key.loc,
              leadingComments: normalizeComments(input.key.leadingComments),
            })
          : normalizeIdentifier(input.key, ctx),
        value: normalizeExpression(input.value, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    case 'SpreadElement':
      return ast.createObjectExpressionSpreadProperty({
        argument: normalizeExpression(input.argument, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    default:
      return ctx.assertNever(input as never);
  }
}
// {
//   type: 'ObjectProperty',
//   start: 68,
//   end: 76,
//   loc: SourceLocation {
//     start: Position { line: 6, column: 22 },
//     end: Position { line: 6, column: 30 }
//   },
//   method: false,
//   key: Node {
//     type: 'Identifier',
//     start: 68,
//     end: 71,
//     loc: SourceLocation {
//       start: [Position],
//       end: [Position],
//       identifierName: 'foo'
//     },
//     name: 'foo'
//   },
//   computed: false,
//   shorthand: false,
//   value: Node {
//     type: 'StringLiteral',
//     start: 73,
//     end: 76,
//     loc: SourceLocation { start: [Position], end: [Position] },
//     extra: { rawValue: 'a', raw: "'a'" },
//     value: 'a'
//   }
// }
