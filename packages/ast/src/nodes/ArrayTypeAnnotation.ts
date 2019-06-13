import NodeKind from '../NodeKind';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = T[];
 *
 * @alias TypeAnnotation
 */
export default interface ArrayTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.ArrayTypeAnnotation;
  readonly elementType: TypeAnnotation;
};
