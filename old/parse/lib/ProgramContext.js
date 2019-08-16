"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const bt = require("@babel/types");
const types_1 = require("@typeconvert/types");
const Context_1 = require("./Context");
const walkStatement_1 = require("./walk/walkStatement");
const babylon_1 = require("./babylon");
const RawDeclaration_1 = require("./walk/RawDeclaration");
class ProgramContext {
    constructor(options) {
        this.parsedFiles = {};
        this.fileContexts = new Map();
        this.parsedFiles = {};
        this.mode = options.mode;
    }
    parse(filename) {
        filename = fs_1.realpathSync(filename);
        if (this.fileContexts.has(filename)) {
            return this.fileContexts.get(filename);
        }
        const src = fs_1.readFileSync(filename, 'utf8');
        const ctx = new Context_1.default(this, filename, src, this.mode);
        this.fileContexts.set(filename, ctx);
        this.parsedFiles[filename] = {
            declarationsByName: ctx.outputDeclarationsByName,
            exportStatements: ctx.outputExportStatements
        };
        const ast = babylon_1.default(src, { filename, mode: ctx.mode });
        ast.program.body.forEach(statement => walkStatement_1.default(statement, ctx));
        if (ctx.commonJSExport) {
            if (bt.isIdentifier(ctx.commonJSExport.expression)) {
                ctx.commonJSExport.context.useIdentifierInExport(ctx.commonJSExport.expression.name);
                ctx.addExportStatement({
                    kind: types_1.ExportKind.CommonJS,
                    localName: ctx.commonJSExport.expression.name
                });
            } else {
                const name = ctx.getName('CommonJsExport');
                ctx.commonJSExport.context.declare(bt.identifier(name), {
                    type: RawDeclaration_1.DeclarationType.VariableDeclaration,
                    mode: types_1.VariableDeclarationMode.const,
                    leadingComments: ctx.commonJSExport.expression.leadingComments || [],
                    localName: name,
                    loc: ctx.commonJSExport.expression.loc && new types_1.SourceLocation(ctx.commonJSExport.expression.loc),
                    init: ctx.commonJSExport.expression
                });
                ctx.commonJSExport.context.useIdentifierInExport(name);
                ctx.addExportStatement({
                    kind: types_1.ExportKind.CommonJS,
                    localName: name
                });
            }
        }
        if (ctx.defaultExport) {
            if (bt.isIdentifier(ctx.defaultExport.expression)) {
                ctx.defaultExport.context.useIdentifierInExport(ctx.defaultExport.expression.name);
                ctx.addExportStatement({
                    kind: types_1.ExportKind.Default,
                    localName: ctx.defaultExport.expression.name
                });
            } else {
                const name = ctx.getName('DefaultExport');
                ctx.defaultExport.context.declare(bt.identifier(name), {
                    type: RawDeclaration_1.DeclarationType.VariableDeclaration,
                    mode: types_1.VariableDeclarationMode.const,
                    leadingComments: ctx.defaultExport.expression.leadingComments || [],
                    localName: name,
                    loc: ctx.defaultExport.expression.loc && new types_1.SourceLocation(ctx.defaultExport.expression.loc),
                    init: ctx.defaultExport.expression
                });
                ctx.defaultExport.context.useIdentifierInExport(name);
                ctx.addExportStatement({
                    kind: types_1.ExportKind.Default,
                    localName: name
                });
            }
        }
        ctx.exportAlls.forEach(relativePath => {
            ctx.addExportStatement({
                kind: types_1.ExportKind.ExportAll,
                relativePath
            });
        });
        ctx.namedExports.forEach((local, exportedName) => {
            local.context.useIdentifierInExport(local.localName);
            ctx.addExportStatement({
                kind: types_1.ExportKind.Named,
                localName: local.localName,
                exportedName
            });
        });
        return ctx;
    }
}
exports.default = ProgramContext;
//# sourceMappingURL=ProgramContext.js.map