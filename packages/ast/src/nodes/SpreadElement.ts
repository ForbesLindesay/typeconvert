import Expression from '../aliases/Expression';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

// N.B. not actually an expression type

export default interface SpreadElement extends NodeBase {
  readonly kind: NodeKind.SpreadElement;
  readonly argument: Expression;
};
