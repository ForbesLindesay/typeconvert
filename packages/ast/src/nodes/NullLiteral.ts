import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     const value = 'foo';
 *
 * @alias Expression
 */
export default interface NullLiteral extends NodeBase {
  readonly kind: NodeKind.NullLiteral;
  readonly value: null;
}
