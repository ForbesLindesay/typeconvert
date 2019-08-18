import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = Object;
 *
 * @alias TypeAnnotation
 */
export default interface AnyObjectTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.AnyObjectTypeAnnotation;
}
