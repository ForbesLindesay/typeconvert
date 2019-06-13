import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = string;
 *
 * @alias TypeAnnotation
 */
export default interface StringTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.StringTypeAnnotation;
};
