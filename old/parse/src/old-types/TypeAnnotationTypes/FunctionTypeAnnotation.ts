import TypeAnnotationKind from '../TypeAnnotationKind';
import FunctionParam from '../FunctionParam';
import TypeParameter from '../TypeParameter';
import TypeAnnotation from '../TypeAnnotation';
import TypeAnnotationBase from '../TypeAnnotationBase';

/**
 * Example:
 *
 *     type value = <T>(x: number, y: T, ...values: string[]) => {x: number, y: T}
 */
export default interface FunctionTypeAnnotation extends TypeAnnotationBase {
  readonly kind: TypeAnnotationKind.FunctionTypeAnnotation;
  readonly params: ReadonlyArray<FunctionParam>;
  readonly restParam: FunctionParam | undefined;
  readonly typeParams: ReadonlyArray<TypeParameter>;
  readonly returnType: TypeAnnotation | undefined;
  readonly isConstructor: boolean;
};
