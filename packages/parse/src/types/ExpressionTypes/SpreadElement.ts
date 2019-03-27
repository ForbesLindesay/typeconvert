import ExpressionBase from '../types/ExpressionBase';
import Expression from '../Expression';

// N.B. not actually an expression type
export default interface SpreadElement extends ExpressionBase {
  readonly type: 'SpreadElement';
  readonly argument: Expression;
};
