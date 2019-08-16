import Identifier from './ExpressionTypes/Identifier';
/**
 * Example:
 *     type x = foo.Bar;
 */
export default interface QualifiedTypeIdentifier {
    readonly kind: 'QualifiedTypeIdentifier';
    readonly qualifier: QualifiedTypeIdentifier | Identifier;
    readonly property: Identifier;
}
