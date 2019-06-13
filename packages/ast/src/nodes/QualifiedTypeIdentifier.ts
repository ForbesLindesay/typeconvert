import TypeIdentifier from './Identifier';
import NodeBase from '../NodeBase';
import NodeKind from '../NodeKind';

/**
 * Example:
 *     type x = foo.Bar;
 *
 */
export default interface QualifiedTypeIdentifier extends NodeBase {
  readonly kind: NodeKind.QualifiedTypeIdentifier;
  readonly qualifier: QualifiedTypeIdentifier | TypeIdentifier;
  readonly property: TypeIdentifier;
};
