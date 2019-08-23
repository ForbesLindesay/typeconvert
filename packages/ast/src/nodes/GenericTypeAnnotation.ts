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
import TypeAnnotation from '../aliases/TypeAnnotation';

/**
 * Examples:
 *
 *     Foo<Bar>
 *
 * @alias TypeAnnotation
 */
export default interface GenericTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.GenericTypeAnnotation;
  readonly type: TypeAnnotation;
  readonly typeArguments: readonly TypeAnnotation[];
}
