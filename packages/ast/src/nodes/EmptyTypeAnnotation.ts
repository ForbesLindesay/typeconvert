import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

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
 *
 * @alias TypeAnnotation
 */
export default interface EmptyTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.EmptyTypeAnnotation;
};
