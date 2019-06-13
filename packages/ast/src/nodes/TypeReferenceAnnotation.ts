import TypeAnnotation from '../aliases/TypeAnnotation';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import TypeIdentifier from './Identifier';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';

/**
 * @alias TypeAnnotation
 */
export default interface TypeReferenceAnnotation extends NodeBase {
  readonly kind: NodeKind.TypeReferenceAnnotation;
  readonly id: TypeIdentifier | QualifiedTypeIdentifier;
  readonly typeParameters: ReadonlyArray<TypeAnnotation>;
};
