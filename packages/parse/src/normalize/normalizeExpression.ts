import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeArrayExpression from './normalizeArrayExpression';
import normalizeIdentifier from './normalizeIdentifier';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';
import normalizeSpreadElement from './normalizeSpreadElement';
import normalizeTypeParameterInstantiation from './normalizeTypeParameterInstantiation';
import normalizeObjectExpression from './normalizeObjectExpression';
import normalizeFunctionExpression from './normalizeFunctionExpression';
import normalizeUnaryExpression from './normalizeUnaryExpression';
import normalizeTemplateLiteral from './normalizeTemplateLiteral';

export default function normalizeExpression(
  input: bt.Expression,
  ctx: ParseContext,
): ast.Expression {
  switch (input.type) {
    case 'ArrowFunctionExpression':
    case 'FunctionExpression':
      return normalizeFunctionExpression(input, ctx);
    case 'ArrayExpression':
      return normalizeArrayExpression(input, ctx);
    case 'CallExpression':
      return ast.createCallExpression({
        callee: normalizeExpression(input.callee, ctx),
        arguments: input.arguments.map(a => {
          if (bt.isSpreadElement(a)) {
            return normalizeSpreadElement(a, ctx);
          }
          if (!bt.isExpression(a)) {
            return ctx.throw(a, 'Expected an expression');
          }
          return normalizeExpression(a, ctx);
        }),
        typeArguments: normalizeTypeParameterInstantiation(
          input.typeArguments || input.typeParameters,
          ctx,
        ),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    //   input.arguments
    case 'Identifier':
      return normalizeIdentifier(input, ctx);
    case 'LogicalExpression':
      return ast.createLogicalExpression({
        left: normalizeExpression(input.left, ctx),
        right: normalizeExpression(input.right, ctx),
        operator: input.operator,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    case 'MemberExpression':
      if (input.computed) {
        return ast.createMemberExpressionComputed({
          object: normalizeExpression(input.object, ctx),
          property: normalizeExpression(input.property, ctx),
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
        });
      }
      return ast.createMemberExpression({
        object: normalizeExpression(input.object, ctx),
        property: normalizeIdentifier(input.property, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    case 'NumericLiteral':
      return ast.createNumericLiteral({
        value: input.value,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    case 'StringLiteral':
      return ast.createStringLiteral({
        value: input.value,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });

    case 'BinaryExpression':
      return ast.createBinaryExpression({
        left: normalizeExpression(input.left, ctx),
        right: normalizeExpression(input.right, ctx),
        operator: input.operator,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });

    case 'ObjectExpression':
      return normalizeObjectExpression(input, ctx);

    case 'NullLiteral':
      return ast.createNullLiteral({
        value: null,
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });

    case 'ConditionalExpression':
      return ast.createConditionalExpression({
        test: normalizeExpression(input.test, ctx),
        consequent: normalizeExpression(input.consequent, ctx),
        alternate: normalizeExpression(input.alternate, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });

    case 'UnaryExpression':
      return normalizeUnaryExpression(input, ctx);

    case 'TemplateLiteral':
      if (input.expressions.length === 0 && input.quasis.length === 1) {
        return ast.createStringLiteral({
          value: input.quasis[0].value.cooked,
          loc: input.loc,
          leadingComments: normalizeComments(input.leadingComments),
        });
      }
      return normalizeTemplateLiteral(input, ctx);
    default:
      return ctx.assertNever(input as never);
  }
}
