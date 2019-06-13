import NodeKind from '../NodeKind';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import NodeBase from '../NodeBase';
import ImportTypeAnnotation from './ImportTypeAnnotation';
import TypeIdentifier from './Identifier';

/**
 * Example:
 *
 *     type value = typeof x;
 *
 * @alias TypeAnnotation
 */
export default interface TypeofTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.TypeofTypeAnnotation;
  readonly id: TypeIdentifier | QualifiedTypeIdentifier | ImportTypeAnnotation;
};
