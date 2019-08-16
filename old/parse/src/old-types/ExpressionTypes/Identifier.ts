import ExpressionKind from '../ExpressionKind';
import ExpressionBase from '../ExpressionBase';

export default interface Identifier extends ExpressionBase {
  readonly kind: ExpressionKind.Identifier;
  readonly name: string;
};
