import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';
import Statement from '../aliases/Statement';

/**
 * if (true) return 1; else return 0;
 *
 * @alias Statement
 */
export default interface IfStatement extends NodeBase {
  kind: NodeKind.IfStatement;
  test: Expression;
  consequent: Statement[];
  alternate: Statement[];
}
