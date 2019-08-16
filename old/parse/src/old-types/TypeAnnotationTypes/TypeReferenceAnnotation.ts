import TypeAnnotation from '../TypeAnnotation';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import TypeIdentifier from './TypeIdentifier';
import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

export default interface TypeReferenceAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.TypeReferenceAnnotation;
  readonly id: TypeIdentifier | QualifiedTypeIdentifier;
  readonly typeParameters: ReadonlyArray<TypeAnnotation>;
};
