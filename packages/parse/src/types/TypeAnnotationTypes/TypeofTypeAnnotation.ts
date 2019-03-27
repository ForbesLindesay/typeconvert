import TypeAnnotationKind from '../TypeAnnotationKind';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import TypeAnnotationBase from '../TypeAnnotationBase';
import ImportTypeAnnotation from './ImportTypeAnnotation';
import TypeIdentifier from './TypeIdentifier';

/**
 * Example:
 *
 *     type value = typeof x;
 */
export default interface TypeofTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.TypeofTypeAnnotation;
  readonly id: TypeIdentifier | QualifiedTypeIdentifier | ImportTypeAnnotation;
};
