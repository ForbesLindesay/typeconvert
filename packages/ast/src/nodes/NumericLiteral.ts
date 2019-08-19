import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     const value = 42;
 *
 * @alias Expression
 */
export default interface NumericLiteral extends NodeBase {
  readonly kind: NodeKind.NumericLiteral;
  readonly value: number;
}
