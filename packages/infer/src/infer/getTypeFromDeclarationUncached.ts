import {
  Declaration,
  TypeReference,
  DeclarationKind,
  TypeKind,
  TypeReferenceKind,
} from '@typeconvert/types';
import {InferScopeContext} from './InferContext';
import Waitable, {DeeperWaitable} from '../utils/Waitable';

/**
 * Given a declaration, extract the type that is declared.
 *
 * Example:
 *     type x = number;
 *
 * Would return a type reference that points to `number`.
 *
 * Example:
 *     declare function x(): number;
 *
 * Would return `null` as it does not declare a type.
 */
export default function getTypeFromDeclarationUncached(
  declaration: DeeperWaitable<Declaration>,
  ctx: InferScopeContext,
): DeeperWaitable<TypeReference | null> {
  switch (declaration.kind) {
    case DeclarationKind.FunctionDeclaration:
    case DeclarationKind.VariableDeclaration:
      return null;
    case DeclarationKind.TypeAlias: {
      const typeParameters = Waitable.resolve(declaration.typeParameters);
      return {
        kind: TypeReferenceKind.LocalVariable,
        type: typeParameters.length
          ? {
              kind: TypeReferenceKind.RawType,
              type: {
                kind: TypeKind.Generic,
                type: declaration.right,
                typeParameters: typeParameters,
                loc: declaration.loc,
              },
              loc: Waitable.resolve(declaration.right).loc,
            }
          : declaration.right,
        name: declaration.localName,
        filename: ctx.filename,
        loc: declaration.loc,
      };
    }
    default:
      return ctx.assertNever(
        'Unsupported declaration kind ' + declaration.kind,
        declaration,
      );
  }
}
