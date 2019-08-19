import Identifier from './Identifier';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

/**
 * Example:
 *     type x = foo.Bar;
 *
 * @alias TypeAnnotation
 */
export default interface QualifiedTypeIdentifier extends NodeBase {
  readonly kind: NodeKind.QualifiedTypeIdentifier;
  readonly qualifier: QualifiedTypeIdentifier | Identifier;
  readonly property: Identifier;
}
