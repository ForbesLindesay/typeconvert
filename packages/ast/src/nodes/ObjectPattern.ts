import Pattern from '../aliases/Pattern';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import Identifier from './Identifier';

/**
 * @alias LVal
 * @alias Pattern
 */
export default interface ObjectPattern extends NodeBase {
  readonly kind: NodeKind.ObjectPattern;
  readonly elements: ReadonlyArray<{
    readonly property: Identifier;
    readonly value: Pattern;
  }>;
  readonly restElement: Pattern | undefined;
}
