import Identifier from '../ExpressionTypes/Identifier';
import TypeAnnotation from '../TypeAnnotation';
import QualifiedTypeIdentifier from '../QualifiedTypeIdentifier';
import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';
export default interface TypeReferenceAnnotation extends TypeAnnotationBase {
    readonly kind: TypeAnnotationKind.TypeReferenceAnnotation;
    readonly id: Identifier | QualifiedTypeIdentifier;
    readonly typeParameters: ReadonlyArray<TypeAnnotation>;
}
