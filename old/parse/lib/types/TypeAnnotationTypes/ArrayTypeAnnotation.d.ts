import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';
/**
 * Example:
 *
 *     type value = T[];
 */
export default interface ArrayTypeAnnotation extends TypeAnnotationBase {
    readonly kind: TypeAnnotationKind.ArrayTypeAnnotation;
    readonly elementType: TypeAnnotation;
}
