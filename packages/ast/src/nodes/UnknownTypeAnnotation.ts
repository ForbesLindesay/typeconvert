import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *     type value = mixed;
 *     type value = unknown;
 *
 * @alias TypeAnnotation
 */
export default interface UnknownTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.UnknownTypeAnnotation;
};
