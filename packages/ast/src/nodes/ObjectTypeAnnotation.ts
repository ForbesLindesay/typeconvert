import NodeKind from '../NodeKind';
import FunctionTypeAnnotation from './FunctionTypeAnnotation';
import TypeAnnotation from '../aliases/TypeAnnotation';
import LiteralTypeAnnotation from './LiteralTypeAnnotation';
import QualifiedTypeIdentifier from './QualifiedTypeIdentifier';
import Variance from '../Variance';
import NodeBase from '../NodeBase';
import Identifier from './Identifier';
import ObjectTypeElement from '../aliases/ObjectTypeElement';
import ObjectExactness from '../ObjectExactness';

/**
 * @alias ObjectTypeElement
 */
export interface ObjectTypeProperty extends NodeBase {
  readonly kind: NodeKind.ObjectTypeProperty;

  readonly key: Identifier | QualifiedTypeIdentifier | LiteralTypeAnnotation;
  /**
   * Example:
   *     declare const X: 'hello world';
   *     type XObject = { [X]: string }
   *     declare const Y: {Z: 'hello world'};
   *     type YObject = { [Y.Z]: string}
   *
   * We do not treat the following as "computed":
   *
   *     type YObject= { ['hello world']: string }
   *     type ZObject= { [42]: string }
   *
   * As they simplify to:
   *
   *     type YObject= { 'hello world': string }
   *     type ZObject= { 42: string }
   *
   */
  readonly computed: boolean;
  /**
   * Example:
   *     type Value = {x?: number}
   */
  readonly optional: boolean;
  /**
   * Flow:
   *     type Value = {+x: number, -y: 42}
   * TypeScript:
   *     type Value = {readonly x: number}
   */
  readonly variance: Variance;

  readonly valueType: TypeAnnotation | undefined;

  /**
   * Flow:
   *     type Value = {get x(): number, set x(v: number): void}
   * Flow uses `kind: 'init'` for normal properties
   */
  readonly mode: 'get' | 'set' | 'normal';
  /**
   * Indicates that the property exists on the `prototype` of a
   * class, rather than directly on the value itself
   */
  readonly proto: boolean;
  /**
   * Indicates that the property exists statically on the class,
   * rather than on instances of the class
   */
  readonly static: boolean;
}
/**
 * Example:
 *
 *     type Value = { [a: number]: string; }
 *
 * @alias ObjectTypeElement
 */
export interface ObjectTypeIndexer extends NodeBase {
  readonly kind: NodeKind.ObjectTypeIndexer;
  readonly id: Identifier | undefined;
  readonly keyType: TypeAnnotation;
  readonly valueType: TypeAnnotation;
  readonly variance: Variance;
  readonly static: boolean;
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
 * In TypeScript generate:
 *
 *     type SpreadTypes<A, B> = Pick<A, Exclude<keyof A, keyof B>> & B;
 *     SpreadTypes<SpreadTypes<{x: 10, y: 5}, {x: 5, z: 10}>, {z: 5}>;
 *
 * @alias ObjectTypeElement
 */
export interface ObjectTypeSpreadProperty extends NodeBase {
  readonly kind: NodeKind.ObjectTypeSpreadProperty;
  readonly argument: TypeAnnotation;
}

/**
 * Example:
 *
 *     type value = {x: number};
 *
 * @alias TypeAnnotation
 */
export default interface ObjectTypeAnnotation extends NodeBase {
  readonly kind: NodeKind.ObjectTypeAnnotation;
  readonly properties: ReadonlyArray<ObjectTypeElement>;
  /**
   * Example:
   *
   *     type Value = { (): number; (x: string): string; y: string; }
   *
   * This is approximately equivalent to:
   *
   *     type Value = () => number && (x: string) => string && { y: string; }
   */
  readonly callProperties: ReadonlyArray<FunctionTypeAnnotation>;

  readonly exactness: ObjectExactness;
}
