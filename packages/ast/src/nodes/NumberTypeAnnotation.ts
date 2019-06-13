import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = number;
 *
 * @alias TypeAnnotation
 */
export default interface NumberTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.NumberTypeAnnotation;
};
