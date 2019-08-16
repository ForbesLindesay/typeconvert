import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = T & S & U;
 */
export default interface IntersectionTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.IntersectionTypeAnnotation;
  readonly types: ReadonlyArray<TypeAnnotation>;
};
