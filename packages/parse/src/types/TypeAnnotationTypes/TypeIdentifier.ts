import ExpressionBase from '../ExpressionBase';

export default interface TypeIdentifier extends ExpressionBase {
  readonly kind: 'TypeIdentifier';
  readonly name: string;
};
