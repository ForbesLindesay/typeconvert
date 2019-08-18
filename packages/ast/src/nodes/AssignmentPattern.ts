import Expression from '../aliases/Expression';
import Pattern from '../aliases/Pattern';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

/**
 * @alias LVal
 * @alias Pattern
 */
export default interface AssignmentPattern extends NodeBase {
  readonly kind: NodeKind.AssignmentPattern;
  readonly left: Pattern;
  readonly right: Expression;
}
