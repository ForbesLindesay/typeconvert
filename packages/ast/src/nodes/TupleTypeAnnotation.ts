import NodeKind from '../NodeKind';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = [number, string, ...number[]]
 *
 * @alias TypeAnnotation
 */
export default interface TupleTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.TupleTypeAnnotation;
  readonly elements: ReadonlyArray<TypeAnnotation>;
  readonly restElement: TypeAnnotation | undefined;
};
