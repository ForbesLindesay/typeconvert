import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     function () { return this; }
 *
 * @alias Expression
 */
export default interface ThisExpression extends NodeBase {
  readonly kind: NodeKind.ThisExpression;
}
