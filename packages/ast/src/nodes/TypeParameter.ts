import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Identifier from './Identifier';
import TypeAnnotation from '../aliases/TypeAnnotation';
import Variance from '../Variance';

/**
 * Example:
 *
 *     type value<T> = {v: T};
 */
export default interface TypeParameter extends NodeBase {
  readonly kind: NodeKind.TypeParameter;
  readonly id: Identifier;
  /**
   * type value<T: string> = {v: T};
   */
  readonly constraint: TypeAnnotation | undefined;
  /**
   * type value<T=string> = {v: T};
   */
  readonly default: TypeAnnotation | undefined;
  /**
   * type value<+T> = {get(): T};
   */
  readonly variance: Variance;
};
