import * as bt from '@babel/types';
import WalkContext from './WalkContext';
import ExpressionKind from './types/ExpressionKind';
import Expression from './types/Expression';
import SpreadElement from './types/ExpressionTypes/SpreadElement';

export function normalizeExpression(
  node: bt.Expression,
  ctx: WalkContext,
): Expression {
  switch (node.type) {
    case 'ArrayExpression':
      return {
        kind: ExpressionKind.ArrayExpression,
        elements: node.elements.map((el): Expression | SpreadElement | null => {
          if (el === null) return null;
          if (el.type === 'SpreadElement')
            return {
              type: 'SpreadElement',
              argument: normalizeExpression(el.argument, ctx),
              loc: el.loc,
            };
          return normalizeExpression(el, ctx);
        }),
        loc: node.loc,
      };
    case 'AssignmentExpression':
      node.left;
      return {};
    default:
      return ctx.assertNever(
        `Unsupported expression type ${(node as any).type}`,
        node,
      );
  }
}
