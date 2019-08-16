import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * Examples:
 *
 *     const x = '10';
 *
 * @alias Statement
 */
export default interface ExpressionStatement extends NodeBase {
  readonly kind: NodeKind.ExpressionStatement;
  readonly expression: Expression;
};
