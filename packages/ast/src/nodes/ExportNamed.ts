import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Identifier from './Identifier';

/**
 * Examples:
 *
 *     export {foo as bar};
 *
 * @alias Statement
 */
export default interface ExportNamed extends NodeBase {
  readonly kind: NodeKind.ExportNamed;
  readonly localName: Identifier;
  readonly exportedName: Identifier;
}
