import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     function foo(): void {}
 *
 * @alias TypeAnnotation
 */
export default interface VoidTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.VoidTypeAnnotation;
}
