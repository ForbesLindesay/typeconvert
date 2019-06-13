import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = any;
 *
 * @alias TypeAnnotation
 */
export default interface AnyTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.AnyTypeAnnotation;
};
