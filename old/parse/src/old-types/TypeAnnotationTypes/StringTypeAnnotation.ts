import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = string;
 */
export default interface StringTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.StringTypeAnnotation;
};
