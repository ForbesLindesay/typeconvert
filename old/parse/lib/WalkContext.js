"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_context_1 = require("@typeconvert/file-context");
class RootWalkContext extends file_context_1.default {
    constructor() {
        super(...arguments);
        this.exports = {
            commonJS: [],
            default: [],
            named: {},
            exportAll: [],
        };
        this.returns = [];
    }
    addCommonJSExport(expression) {
        this.exports.commonJS.push(expression);
    }
    addDefaultExport(expression) {
        this.exports.default.push(expression);
    }
    addExportAll(exportAll) {
        this.exports.exportAll.push(exportAll);
    }
    addNamedExport(declaration) {
        const exports = this.exports.named[name] || [];
        this.exports.named[name] = exports;
        exports.push(declaration);
    }
    addReturn(statement) {
        this.returns.push(statement);
    }
    getResult() {
        return {
            filename: this.filename,
            src: this.src,
            exports: this.exports,
            returns: this.returns,
        };
    }
    getContext() {
        return new WalkContext(this);
    }
}
exports.RootWalkContext = RootWalkContext;
class WalkContext extends file_context_1.default {
    constructor(root, parent) {
        super(root.filename, root.src, root.mode);
        this.declarations = {};
        this.root = root;
        this.scope = {
            parent: parent ? parent.scope : undefined,
            declarations: this.declarations,
            filename: root.filename,
        };
    }
    addDeclaration(identifier, declaration) {
        const name = identifier.name;
        const declarations = this.declarations[name] || [];
        this.declarations[name] = declarations;
        declarations.push(declaration);
        return declaration;
    }
    addCommonJSExport(expression) {
        this.root.addCommonJSExport({
            value: expression,
            scope: this.scope,
        });
    }
    addDefaultExport(expression) {
        this.root.addDefaultExport({
            value: expression,
            scope: this.scope,
        });
    }
    addExportAll(exportAll) {
        this.root.addExportAll({
            value: exportAll,
            scope: this.scope,
        });
    }
    addNamedExport(declaration) {
        this.root.addNamedExport({
            value: declaration,
            scope: this.scope,
        });
    }
    addReturn(statement) {
        this.root.addReturn({
            value: statement,
            scope: this.scope,
        });
    }
    getBlockContext() {
        return new WalkContext(this.root, this);
    }
}
exports.default = WalkContext;
//# sourceMappingURL=WalkContext.js.map