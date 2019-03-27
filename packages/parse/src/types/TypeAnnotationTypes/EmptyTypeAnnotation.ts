import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Examples:
 *
 *     type value = never;
 *     type value = empty;
 *
 *     const x: 'a' | 'b';
 *     switch (x) {
 *       case 'a':
 *       case 'b':
 *         break;
 *       default:
 *         return assertNever(value);
 *     }
 *     function assertNever(value: never): never {
 *       throw new Error('TypeScript/Flow will ensure this is unreachalbe');
 *     }
 */
export default interface EmptyTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.EmptyTypeAnnotation;
};
