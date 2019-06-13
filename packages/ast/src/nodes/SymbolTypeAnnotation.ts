import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = symbol;
 *
 * Example 2:
 *
 *     declare const v: unqiue symbol;
 *     type value = typeof v;
 *
 * @alias TypeAnnotation
 */
export default interface SymbolTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.SymbolTypeAnnotation;
  readonly unique: boolean;
};
