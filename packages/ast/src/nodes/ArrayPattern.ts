import Pattern from '../aliases/Pattern';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

/**
 * @alias LVal
 * @alias Pattern
 */
export default interface ArrayPattern extends NodeBase {
  readonly kind: NodeKind.ArrayPattern;
  readonly elements: readonly Pattern[];
  readonly restElement: Pattern | undefined;
}
