import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *     type value = mixed;
 *     type value = unknown;
 */
export default interface UnknownTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.UnknownTypeAnnotation;
};
