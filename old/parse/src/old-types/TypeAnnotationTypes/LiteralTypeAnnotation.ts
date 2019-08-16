import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Examples:
 *
 *     type value = true;
 *     type value = 42;
 *     type value = 'hello world';
 *     type value = null;
 */
export default interface LiteralTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.LiteralTypeAnnotation;
  readonly value: boolean | string | number | null | undefined;
};
