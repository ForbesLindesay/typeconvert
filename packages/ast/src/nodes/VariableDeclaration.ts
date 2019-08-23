import TypeAnnotation from '../aliases/TypeAnnotation';
import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import Pattern from '../aliases/Pattern';
import Expression from '../aliases/Expression';

/**
 * @alias Statement
 * @alias Declaration
 * @alias ValueDeclaration
 */
export default interface VariableDeclaration extends NodeBase {
  readonly kind: NodeKind.VariableDeclaration;
  readonly id: Pattern;
  readonly mode: 'var' | 'let' | 'const';
  /**
   * You can declare a variable that you know is globally
   * defined. This doesn't output anything at runtime
   *
   * Example:
   *   declare const FOO: string;
   *   console.log(FOO);
   */
  readonly declare: boolean;
  readonly type: TypeAnnotation | undefined;
  readonly init: Expression | undefined;
  /**
   * In TypeScript you can mark a variable as "definitely assigned"
   * This makes TypeScript assume that the variable is assigned
   * a value bevore it is used, even if TypeScript cannot verify
   * that this is the case.
   *
   * Example:
   *   let x!: string;
   *   if (1 + 1 == 2) {
   *     x = 'Hello World';
   *   }
   *   console.log(x);
   */
  readonly definite: boolean;
}
