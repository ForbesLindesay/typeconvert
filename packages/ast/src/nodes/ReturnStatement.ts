import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * return undefined;
 *
 * @alias Statement
 */
export default interface ReturnStatement extends NodeBase {
  kind: NodeKind.ReturnStatement;
  argument: Expression;
}
