import TypeAnnotation from '../aliases/TypeAnnotation';
import Identifier from './Identifier';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import TypeParameter from './TypeParameter';
import FunctionParameter from './FunctionParameter';
import Statement from '../aliases/Statement';

/**
 * @alias Expression
 */
export default interface FunctionExpression extends NodeBase {
  readonly kind: NodeKind.FunctionExpression;
  readonly isArrowFunction: boolean;
  readonly id: Identifier | undefined;
  readonly params: readonly FunctionParameter[];
  readonly restParam: FunctionParameter | undefined;
  readonly typeParams: readonly TypeParameter[];
  readonly returnType: TypeAnnotation | undefined;
  readonly body: readonly Statement[];
}
