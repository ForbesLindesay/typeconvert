import NodeKind from '../NodeKind';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = T & S & U;
 *
 * @alias TypeAnnotation
 */
export default interface IntersectionTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.IntersectionTypeAnnotation;
  readonly types: ReadonlyArray<TypeAnnotation>;
};
