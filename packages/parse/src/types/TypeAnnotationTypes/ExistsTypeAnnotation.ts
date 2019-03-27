import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Examples:
 *
 *     type value = Something<string, *>
 */
export default interface ExistsTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.ExistsTypeAnnotation;
};
