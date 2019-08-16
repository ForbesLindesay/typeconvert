import TypeAnnotationKind from '../TypeAnnotationKind';
import QualifiedTypeIdentifier from '../QualifiedTypeIdentifier';
import Identifier from '../ExpressionTypes/Identifier';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';
/**
 * Example:
 *
 *     type value = import('./foo').bar;
 */
export default interface ImportTypeAnnotation extends TypeAnnotationBase {
    readonly kind: TypeAnnotationKind.ImportTypeAnnotation;
    readonly relativePath: string;
    readonly qualifier: Identifier | QualifiedTypeIdentifier | undefined;
    readonly typeParameters: ReadonlyArray<TypeAnnotation>;
}
