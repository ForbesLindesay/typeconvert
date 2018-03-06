import {ExportStatement, ExportKind, Mode} from '@typeconvert/types';
import Context from './Context';

function _printExportStatement(
  exportStatement: ExportStatement,
  ctx: Context,
): void {
  switch (exportStatement.kind) {
    case ExportKind.CommonJS:
      ctx.read(exportStatement.localName);
      if (ctx.mode === Mode.flow) {
        ctx.pushExport(`module.exports = ${exportStatement.localName};`);
      } else {
        ctx.pushExport(`export= ${exportStatement.localName};`);
      }
      break;
    case ExportKind.Default:
      ctx.read(exportStatement.localName);
      ctx.pushExport(`export default ${exportStatement.localName};`);
      break;
    case ExportKind.ExportAll:
      if (ctx.mode === Mode.flow) {
        return exportStatement;
      } else {
        ctx.pushExport(`export * from '${exportStatement.relativePath}';`);
      }
      break;
    case ExportKind.Named:
      ctx.read(exportStatement.localName);
      if (exportStatement.exportedName !== exportStatement.localName) {
        ctx.pushExport(
          `export {${exportStatement.localName} as ${
            exportStatement.exportedName
          }};`,
        );
      } else {
        ctx.pushExport(`export {${exportStatement.localName}};`);
      }
      break;
    default:
      return exportStatement;
  }
}

export default function printExportStatement(
  exportStatement: ExportStatement,
  ctx: Context,
): void {
  const result = _printExportStatement(exportStatement, ctx);
  if (result) {
    throw new Error('Unsupported export kind ' + exportStatement.kind);
  }
}
