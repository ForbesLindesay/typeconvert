import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Statement from '../aliases/Statement';

export default interface File extends NodeBase {
  readonly kind: NodeKind.File;
  readonly statements: readonly Statement[];
}
