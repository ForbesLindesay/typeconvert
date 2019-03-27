import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = symbol;
 *
 * Example 2:
 *
 *     declare const v: unqiue symbol;
 *     type value = typeof v;
 */
export default interface SymbolTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.SymbolTypeAnnotation;
  readonly unique: boolean;
};
