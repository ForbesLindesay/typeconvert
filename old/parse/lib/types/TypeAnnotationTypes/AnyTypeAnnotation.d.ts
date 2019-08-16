import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';
/**
 * Example:
 *
 *     type value = any;
 */
export default interface AnyTypeAnnotation extends TypeAnnotationBase {
    readonly kind: TypeAnnotationKind.AnyTypeAnnotation;
}
