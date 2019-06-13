import NodeKind from '../NodeKind';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = T | S | U;
 *
 * @alias TypeAnnotation
 */
export default interface UnionTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.UnionTypeAnnotation;
  readonly types: ReadonlyArray<TypeAnnotation>;
};
