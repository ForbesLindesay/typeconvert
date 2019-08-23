import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Identifier from './Identifier';
import Expression from '../aliases/Expression';
import ObjectExpressionElement from '../aliases/ObjectExpressionElement';
import StringLiteral from './StringLiteral';
import NumericLiteral from './NumericLiteral';

/**
 * @alias ObjectExpressionElement
 */
export interface ObjectExpressionProperty extends NodeBase {
  readonly kind: NodeKind.ObjectExpressionProperty;

  readonly key: Identifier | StringLiteral | NumericLiteral;

  readonly value: Expression;
}

/**
 * @alias ObjectExpressionElement
 */
export interface ObjectExpressionComputedProperty extends NodeBase {
  readonly kind: NodeKind.ObjectExpressionComputedProperty;

  readonly key: Expression;

  readonly value: Expression;
}

/**
 * Example:
 *
 *     {x: 10, y: 5, ...{x: 5, z: 10}, z: 5}
 *
 * Is equivalent to:
 *
 *     {x: 5, y: 5, z: 5}
 *
 * @alias ObjectExpressionElement
 */
export interface ObjectExpressionSpreadProperty extends NodeBase {
  readonly kind: NodeKind.ObjectExpressionSpreadProperty;
  readonly argument: Expression;
}

/**
 * Example:
 *
 *     const value = {x: 42};
 *
 * @alias Expression
 */
export default interface ObjectExpression extends NodeBase {
  readonly kind: NodeKind.ObjectExpression;
  readonly properties: ReadonlyArray<ObjectExpressionElement>;
}
