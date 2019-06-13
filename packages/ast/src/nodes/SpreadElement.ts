import ExpressionBase from '../types/ExpressionBase';
import Expression from '../../../parse/src/types/Expression';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

// N.B. not actually an expression type

export default interface SpreadElement extends NodeBase {
  readonly kind: NodeKind.SpreadElement;
  readonly argument: Expression;
};
