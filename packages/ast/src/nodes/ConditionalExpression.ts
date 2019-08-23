import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * Examples:
 *
 *     x ? y : z
 *
 * @alias Expression
 */
export default interface ConditionalExpression extends NodeBase {
  readonly kind: NodeKind.ConditionalExpression;
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}
