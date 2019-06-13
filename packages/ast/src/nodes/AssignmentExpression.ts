import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import LVal from '../aliases/LVal';
import Expression from '../aliases/Expression';

// operator is always '='
// we normalize according to https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Assignment_Operators

/**
 * @alias Expression
 */
export default interface AssignmentExpression extends NodeBase {
  readonly kind: NodeKind.AssignmentExpression;
  readonly left: LVal;
  readonly right: Expression;
};
