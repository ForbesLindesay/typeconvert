import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Examples:
 *
 *     type value = true;
 *     type value = 42;
 *     type value = 'hello world';
 *     type value = null;
 *
 * @alias TypeAnnotation
 */
export default interface LiteralTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.LiteralTypeAnnotation;
  readonly value: boolean | string | number | null | undefined;
};
