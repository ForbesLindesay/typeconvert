import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = null;
 *
 * @alias TypeAnnotation
 */
export default interface NullLiteralTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.NullLiteralTypeAnnotation;
}
