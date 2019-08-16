import {
  Declaration,
  DeclarationKind,
  Type,
  TypeKind,
  ExportKind,
  DefaultExportStatement,
} from '@typeconvert/types';
import Context from './Context';

function _getTypeOfDeclarationValue(
  declaration: Declaration,
  ctx: Context,
): Type {
  switch (declaration.kind) {
    case DeclarationKind.FunctionDeclaration:
      return {
        kind: TypeKind.Function,
        params: declaration.params,
        restParam: declaration.restParam,
        returnType: declaration.returnType,
        typeParameters: declaration.typeParameters,
        loc: declaration.loc,
      };
    case DeclarationKind.ImportDefault: {
      const dep = ctx.programContext.parse(declaration.filename);
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
      return declaration;
  }
}

export default function getTypeOfDeclarationValue(
  declaration: Declaration,
  ctx: Context,
): Type {
  const result = _getTypeOfDeclarationValue(declaration, ctx);
  if ((result as any) === declaration) {
    throw ctx.getError('Unsupported type ' + declaration.kind, declaration);
  }
  return result;
}
