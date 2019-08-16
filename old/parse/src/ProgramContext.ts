import {readFileSync, realpathSync} from 'fs';
import * as bt from '@babel/types';
import {ExportKind, Mode, Module, SourceLocation} from '@typeconvert/types';
import {DeclarationType, VariableDeclarationMode} from './RawDeclaration';
import Context from './Context';
import walkStatement from './walkStatement';
import babylonParse from './babylon';

export interface Options {
  mode: Mode;
}
export interface Modules {
  [filename: string]: Module | undefined;
}
export default class ProgramContext {
  public readonly parsedFiles: Modules = {};
  public readonly fileContexts = new Map<string, Context>();
  public readonly mode: Mode;
  constructor(options: Options) {
    this.parsedFiles = {};
    this.mode = options.mode;
  }
  parse(filename: string): Context {
    filename = realpathSync(filename);
    if (this.fileContexts.has(filename)) {
      return this.fileContexts.get(filename)!;
    }
    const src = readFileSync(filename, 'utf8');
    const ctx = new Context(this, filename, src, this.mode);
    this.fileContexts.set(filename, ctx);
    this.parsedFiles[filename] = {
      declarationsByName: ctx.outputDeclarationsByName,
      exportStatements: ctx.outputExportStatements,
    };
    const ast = babylonParse(src, {filename, mode: ctx.mode});
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
          leadingComments: ctx.commonJSExport.expression.leadingComments || [],
          localName: name,
          loc:
            ctx.commonJSExport.expression.loc &&
            new SourceLocation(ctx.commonJSExport.expression.loc),
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
          leadingComments: ctx.defaultExport.expression.leadingComments || [],
          localName: name,
          loc:
            ctx.defaultExport.expression.loc &&
            new SourceLocation(ctx.defaultExport.expression.loc),
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
    return ctx;
  }
}
