import TypeAnnotationKind from '../TypeAnnotationKind';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';
import TypeIdentifier from './TypeIdentifier';

/**
 * Example:
 *
 *     type value = import('./foo').bar;
 */
export default interface ImportTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.ImportTypeAnnotation;
  readonly relativePath: string;
  readonly qualifier: TypeIdentifier | QualifiedTypeIdentifier | undefined;
  readonly typeParameters: ReadonlyArray<TypeAnnotation>;
};
