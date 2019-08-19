import Identifier from './Identifier';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import Expression from '../aliases/Expression';

/**
 * Example:
 *     const x = foo.bar;
 *
 * @alias Expression
 */
export default interface MemberExpression extends NodeBase {
  readonly kind: NodeKind.MemberExpression;
  readonly object: Expression;
  readonly property: Identifier;
}
