import TypeAnnotation from '../aliases/TypeAnnotation';
import Identifier from './Identifier';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import TypeParameter from './TypeParameter';

/**
 * @alias Statement
 * @alias Declaration
 * @alias TypeDeclaration
 */
export default interface TypeAliasDeclaration extends NodeBase {
  readonly kind: NodeKind.TypeAliasDeclaration;
  readonly id: Identifier;
  readonly typeParameters: TypeParameter[];
  readonly type: TypeAnnotation;
}
