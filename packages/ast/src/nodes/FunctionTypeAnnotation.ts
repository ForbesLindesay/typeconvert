import NodeKind from '../NodeKind';
import FunctionParam from '../FunctionParam';
import TypeParameter from '../TypeParameter';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';

/**
 * Example:
 *
 *     type value = <T>(x: number, y: T, ...values: string[]) => {x: number, y: T}
 *
 * @alias TypeAnnotation
 */
export default interface FunctionTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.FunctionTypeAnnotation;
  readonly params: ReadonlyArray<FunctionParam>;
  readonly restParam: FunctionParam | undefined;
  readonly typeParams: ReadonlyArray<TypeParameter>;
  readonly returnType: TypeAnnotation | undefined;
  readonly isConstructor: boolean;
};
