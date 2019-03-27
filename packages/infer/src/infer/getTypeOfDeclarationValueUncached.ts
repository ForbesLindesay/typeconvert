import {
  Declaration,
  DeclarationKind,
  TypeKind,
  TypeReference,
  ExportKind,
  DefaultExportStatement,
  TypeReferenceKind,
} from '@typeconvert/types';
import {InferScopeContext} from './InferContext';
import Waitable, {DeeperWaitable} from '../utils/Waitable';

/**
 * Given a declaration, extract the type of the value that is declared.
 *
 * Example:
 *     type x = number;
 *
 * Would return null as it does not declare a value.
 *
 * Example:
 *     declare function x(): number;
 *
 * Would return `() => number`
 */
export default function getTypeOfDeclarationValueUncached(
  declaration: DeeperWaitable<Declaration>,
  ctx: InferScopeContext,
): DeeperWaitable<TypeReference | null> {
  switch (declaration.kind) {
    case DeclarationKind.TypeAlias:
    case DeclarationKind.Interface:
      return null;
    case DeclarationKind.VariableDeclaration:
      return {
        kind: TypeReferenceKind.LocalVariable,
        type: declaration.typeAnnotation,
        name: declaration.localName,
        filename: ctx.filename,
        loc: declaration.loc,
      };
    case DeclarationKind.FunctionDeclaration:
      return {
        kind: TypeReferenceKind.LocalVariable,
        type: {
          kind: TypeReferenceKind.RawType,
          type: {
            kind: TypeKind.Function,
            params: declaration.params,
            restParam: declaration.restParam,
            returnType: declaration.returnType,
            typeParameters: declaration.typeParameters,
            loc: declaration.loc,
          },
          loc: declaration.loc,
        },
        name: declaration.localName,
        filename: ctx.filename,
        loc: declaration.loc,
      };
    case DeclarationKind.ImportDefault: {
      const filename = Waitable.resolve(declaration.filename);
      const dep = ctx.programContext.getExports(filename);
      const statements = dep.outputExportStatements.filter(
        (s): s is DefaultExportStatement => s.kind === ExportKind.Default,
      );
      if (statements.length === 0) {
        throw ctx.getError(
          `Could not find default export in "${dep.filename}"`,
          declaration,
        );
      }
      if (statements.length > 1) {
        throw ctx.getError(
          `Found multiple default exports in "${dep.filename}"`,
          declaration,
        );
      }
      const t = dep.getResolvedTypeOfIdentifierValue({
        kind: TypeKind.TypeOf,
        name: statements[0].localName,
        filename: declaration.filename,
        loc: null,
      });
      if (!t) {
        throw ctx.getError(
          `Could not resolve type of default export for "${dep.filename}"`,
          declaration,
        );
      }
      return t;
    }
    default:
      return ctx.assertNever(
        'Unsupported type ' + declaration.kind,
        declaration,
      );
  }
}
