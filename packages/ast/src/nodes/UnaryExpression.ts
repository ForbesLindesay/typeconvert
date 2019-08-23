import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import Expression from '../aliases/Expression';

/**
 * e.g.
 *   !a
 *
 * @alias Expression
 */
export default interface UnaryExpression extends NodeBase {
  readonly kind: NodeKind.UnaryExpression;
  readonly argument: Expression;
  readonly operator:
    | 'void'
    | 'throw'
    | 'delete'
    | '!'
    | '+'
    | '-'
    | '~'
    | 'typeof';
}
