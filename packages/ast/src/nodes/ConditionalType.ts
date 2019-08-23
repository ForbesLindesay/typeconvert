import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import TypeAnnotation from '../aliases/TypeAnnotation';

/**
 * Examples:
 *
 *     type foo<T> = T extends string ? number : boolean
 *
 * @alias TypeAnnotation
 */
export default interface ConditionalType extends NodeBase {
  readonly kind: NodeKind.ConditionalType;
  test: {
    left: TypeAnnotation;
    operation: 'extends';
    right: TypeAnnotation;
  };
  consequent: TypeAnnotation;
  alternate: TypeAnnotation;
}
