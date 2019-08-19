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
import TypeAnnotation from '../aliases/TypeAnnotation';
import SpreadElement from './SpreadElement';

/**
 * Examples:
 *
 *     foo(1, 2, 3);
 *     bar(...values);
 *     bing<string>('x', 'y');
 *
 * @alias Expression
 */
export default interface CallExpression extends NodeBase {
  readonly kind: NodeKind.CallExpression;
  readonly callee: Expression;
  readonly arguments: ReadonlyArray<null | Expression | SpreadElement>;
  readonly typeArguments: readonly TypeAnnotation[];
}
