import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import Expression from '../aliases/Expression';

/**
 * e.g.
 *   a || b
 *   a && b
 *
 * @alias Expression
 */
export default interface LogicalExpression extends NodeBase {
  readonly kind: NodeKind.LogicalExpression;
  readonly left: Expression;
  readonly right: Expression;
  readonly operator: '||' | '&&' | '??';
}
