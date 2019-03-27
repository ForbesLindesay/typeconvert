import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = T | S | U;
 */
export default interface UnionTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.UnionTypeAnnotation;
  readonly types: ReadonlyArray<TypeAnnotation>;
};
