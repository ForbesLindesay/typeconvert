import NodeKind from '../NodeKind';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';
import LVal from '../aliases/LVal';

/**
 * Example:
 *
 *     type value = <T>(x: number, y: T, ...values: string[]) => {x: number, y: T}
 */
export default interface FunctionParameter extends NodeBase {
  readonly kind: NodeKind.FunctionParameter;
  readonly name?: LVal;
  readonly type?: TypeAnnotation;
};