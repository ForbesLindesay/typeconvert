import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import Expression from '../aliases/Expression';

/**
 * Example:
 *     const x = foo.bar;
 *
 * @alias Expression
 */
export default interface MemberExpressionComputed extends NodeBase {
  readonly kind: NodeKind.MemberExpressionComputed;
  readonly object: Expression;
  readonly property: Expression;
}
