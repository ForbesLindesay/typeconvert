import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * Examples:
 *
 *     export default foo;
 *
 * @alias Statement
 */
export default interface ExportDefault extends NodeBase {
  readonly kind: NodeKind.ExportDefault;
  readonly expression: Expression;
}
