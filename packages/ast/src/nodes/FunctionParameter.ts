import NodeKind from '../NodeKind';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';
import Pattern from '../aliases/Pattern';

/**
 * Example:
 *
 *     type value = <T>(x: number, y: T, ...values: string[]) => {x: number, y: T}
 */
export default interface FunctionParameter extends NodeBase {
  readonly kind: NodeKind.FunctionParameter;
  readonly name: Pattern | undefined;
  readonly type: TypeAnnotation | undefined;
  readonly optional: boolean;
}
