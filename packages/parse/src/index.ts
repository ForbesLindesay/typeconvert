import {readFileSync} from 'fs';
import * as bt from '@babel/types';
import {ExportKind, Mode, Module} from '@typeconvert/types';
import {DeclarationType, VariableDeclarationMode} from './RawDeclaration';
import Context from './Context';
import walkStatement from './walkStatement';
import babylonParse from './babylon';

export {Mode};
export default function parse(filename: string, mode: Mode): Module {
  const src = readFileSync(filename, 'utf8');
  const ctx = new Context(filename, src, mode);
  const ast = babylonParse(src, {filename, mode});
  ast.program.body.forEach(statement => walkStatement(statement, ctx));
  if (ctx.commonJSExport) {
    if (bt.isIdentifier(ctx.commonJSExport.expression)) {
      ctx.commonJSExport.context.useIdentifierInExport(
        ctx.commonJSExport.expression.name,
      );
      ctx.addExportStatement({
        kind: ExportKind.CommonJS,
        localName: ctx.commonJSExport.expression.name,
      });
    } else {
      const name = ctx.getName('CommonJsExport');
      ctx.commonJSExport.context.declare(bt.identifier(name), {
        type: DeclarationType.VariableDeclaration,
        mode: VariableDeclarationMode.const,
        localName: name,
        init: ctx.commonJSExport.expression,
      });
      ctx.commonJSExport.context.useIdentifierInExport(name);
      ctx.addExportStatement({
        kind: ExportKind.CommonJS,
        localName: name,
      });
    }
  }
  if (ctx.defaultExport) {
    if (bt.isIdentifier(ctx.defaultExport.expression)) {
      ctx.defaultExport.context.useIdentifierInExport(
        ctx.defaultExport.expression.name,
      );
      ctx.addExportStatement({
        kind: ExportKind.Default,
        localName: ctx.defaultExport.expression.name,
      });
    } else {
      const name = ctx.getName('DefaultExport');
      ctx.defaultExport.context.declare(bt.identifier(name), {
        type: DeclarationType.VariableDeclaration,
        mode: VariableDeclarationMode.const,
        localName: name,
        init: ctx.defaultExport.expression,
      });
      ctx.defaultExport.context.useIdentifierInExport(name);
      ctx.addExportStatement({
        kind: ExportKind.Default,
        localName: name,
      });
    }
  }
  ctx.exportAlls.forEach(relativePath => {
    ctx.addExportStatement({
      kind: ExportKind.ExportAll,
      relativePath,
    });
  });
  ctx.namedExports.forEach((local, exportedName) => {
    local.context.useIdentifierInExport(local.localName);
    ctx.addExportStatement({
      kind: ExportKind.Named,
      localName: local.localName,
      exportedName,
    });
  });
  return ctx.toJSON();
}
