import ExpressionKind from '../ExpressionKind';
import ExpressionBase from '../ExpressionBase';
import Expression from '../Expression';
import SpreadElement from './SpreadElement';

export default interface ArrayExpression extends ExpressionBase {
  readonly kind: ExpressionKind.ArrayExpression;
  readonly elements: ReadonlyArray<null | Expression | SpreadElement>;
};
