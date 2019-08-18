import TypeAnnotation from '../aliases/TypeAnnotation';
import Identifier from './Identifier';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import TypeParameter from './TypeParameter';
import FunctionParameter from './FunctionParameter';
import Statement from '../aliases/Statement';

/**
 * @alias Statement
 * @alias Declaration
 * @alias ValueDeclaration
 */
export default interface FunctionDeclaration extends NodeBase {
  readonly kind: NodeKind.FunctionDeclaration;
  readonly id: Identifier;
  readonly params: readonly FunctionParameter[];
  readonly restParam: FunctionParameter | undefined;
  readonly typeParams: readonly TypeParameter[];
  readonly returnType: TypeAnnotation | undefined;
  readonly body: readonly Statement[];
}
