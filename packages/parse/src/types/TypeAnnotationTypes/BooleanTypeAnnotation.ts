import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = boolean;
 */
export default interface BooleanTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.BooleanTypeAnnotation;
};
