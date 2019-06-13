import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = boolean;
 *
 * @alias TypeAnnotation
 */
export default interface BooleanTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.BooleanTypeAnnotation;
};
