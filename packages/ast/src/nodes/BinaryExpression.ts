import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';
import Expression from '../aliases/Expression';

/**
 * e.g.
 *   a + b
 *   a === b
 *
 * @alias Expression
 */
export default interface BinaryExpression extends NodeBase {
  readonly kind: NodeKind.BinaryExpression;
  readonly left: Expression;
  readonly right: Expression;
  readonly operator:
    | '+'
    | '-'
    | '/'
    | '%'
    | '*'
    | '**'
    | '&'
    | '|'
    | '>>'
    | '>>>'
    | '<<'
    | '^'
    | '=='
    | '==='
    | '!='
    | '!=='
    | 'in'
    | 'instanceof'
    | '>'
    | '<'
    | '>='
    | '<=';
}
