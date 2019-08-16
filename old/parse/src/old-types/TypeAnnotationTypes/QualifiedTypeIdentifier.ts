import TypeIdentifier from './TypeIdentifier';

/**
 * Example:
 *     type x = foo.Bar;
 */
export default interface QualifiedTypeIdentifier {
  readonly kind: 'QualifiedTypeIdentifier';
  readonly qualifier: QualifiedTypeIdentifier | TypeIdentifier;
  readonly property: TypeIdentifier;
};
