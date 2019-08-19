import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     const value = 'foo';
 *
 * @alias Expression
 */
export default interface StringLiteral extends NodeBase {
  readonly kind: NodeKind.StringLiteral;
  readonly value: string;
}
