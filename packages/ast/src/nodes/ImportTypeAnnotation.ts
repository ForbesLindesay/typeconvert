import NodeKind from '../NodeKind';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeBase from '../NodeBase';
import TypeIdentifier from './Identifier';

/**
 * Example:
 *
 *     type value = import('./foo').bar;
 *
 * @alias TypeAnnotation
 */
export default interface ImportTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.ImportTypeAnnotation;
  readonly relativePath: string;
  readonly qualifier: TypeIdentifier | QualifiedTypeIdentifier | undefined;
  readonly typeParameters: ReadonlyArray<TypeAnnotation>;
};
