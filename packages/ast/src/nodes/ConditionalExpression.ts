// export interface CallExpression extends BaseNode {
//   type: 'CallExpression';
//   callee: Expression;
//   arguments: Array<
//     Expression | SpreadElement | JSXNamespacedName | ArgumentPlaceholder
//   >;
//   optional: true | false | null;
//   typeArguments: TypeParameterInstantiation | null;
//   typeParameters: TSTypeParameterInstantiation | null;
// }

import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * Examples:
 *
 *     x ? y : z
 *
 * @alias Expression
 */
export default interface ConditionalExpression extends NodeBase {
  readonly kind: NodeKind.ConditionalExpression;
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}
