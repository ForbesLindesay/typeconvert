import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Expression from '../aliases/Expression';

/**
 * Example:
 *
 *     `${x}\n${y}`
 */
export interface TemplateElement extends NodeBase {
  readonly kind: NodeKind.TemplateElement;
  /**
   * e.g. "\\n"
   */
  rawValue: string;
  /**
   * e.g. "\n"
   */
  cookedValue: string;
}

/**
 * Example:
 *
 *     `${property} ${properties[1]}`
 *
 * @alias Expression
 */
export default interface TemplateLiteral extends NodeBase {
  readonly kind: NodeKind.TemplateLiteral;
  readonly expressions: readonly Expression[];
  readonly quasis: readonly TemplateElement[];
}
