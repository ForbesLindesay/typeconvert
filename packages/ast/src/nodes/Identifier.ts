import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

/**
 * @alias Expression
 * @alias LVal
 */
export default interface Identifier extends NodeBase {
  readonly kind: NodeKind.Identifier;
  readonly name: string;
};