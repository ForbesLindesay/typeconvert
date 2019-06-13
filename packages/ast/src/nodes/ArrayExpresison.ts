import SpreadElement from './SpreadElement';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * @alias Expression
 */
export default interface ArrayExpression extends NodeBase {
  readonly kind: NodeKind.ArrayExpression;
  readonly elements: ReadonlyArray<null | Expression | SpreadElement>;
};
