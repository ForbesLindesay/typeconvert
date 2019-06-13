import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Examples:
 *
 *     type value = Something<string, *>
 *
 * @alias TypeAnnotation
 */
export default interface ExistsTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.ExistsTypeAnnotation;
};
