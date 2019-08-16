import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = any;
 */
export default interface ThisTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.ThisTypeAnnotation;
};
