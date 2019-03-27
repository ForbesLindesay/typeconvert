import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = number;
 */
export default interface NumberTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.NumberTypeAnnotation;
};
