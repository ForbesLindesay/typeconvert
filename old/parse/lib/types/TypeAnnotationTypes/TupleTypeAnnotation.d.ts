import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';
/**
 * Example:
 *
 *     type value = [number, string, ...number[]]
 */
export default interface TupleTypeAnnotation extends TypeAnnotationBase {
    readonly kind: TypeAnnotationKind.TupleTypeAnnotation;
    readonly elements: ReadonlyArray<TypeAnnotation>;
    readonly restElement: TypeAnnotation | undefined;
}
