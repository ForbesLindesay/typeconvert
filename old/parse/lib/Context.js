"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const fs_1 = require("fs");
const resolve_1 = require("resolve");
const types_1 = require("@typeconvert/types");
const getNormalizedDeclaration_1 = require("./getNormalizedDeclaration");
const getTypeFromDeclaration_1 = require("./getTypeFromDeclaration");
const getTypeOfDeclarationValue_1 = require("./getTypeOfDeclarationValue");
const { codeFrameColumns } = require('@babel/code-frame');
var ContextType;
(function (ContextType) {
    ContextType["File"] = "File";
    ContextType["Function"] = "Function";
    ContextType["Block"] = "Block";
})(ContextType = exports.ContextType || (exports.ContextType = {}));
class Context {
    constructor(programContext, filename, src, mode, type = ContextType.File, parent, params) {
        this.declarations = new Map();
        this.boundNames = new Set();
        this.defaultExport = null;
        this.commonJSExport = null;
        // export name => local name
        this.namedExports = new Map();
        this.returnValues = [];
        this.exportAlls = [];
        this.outputDeclarationsByName = {};
        this.outputExportStatements = [];
        this._resolveCache = {};
        this.programContext = programContext;
        this.filename = filename;
        this.src = src;
        this.mode = mode;
        this.type = type;
        this.parent = parent;
        this.params = params || [];
    }
    getImport(relativePath) {}
    getFunctionContext(params) {
        return new Context(this.programContext, this.filename, this.src, this.mode, ContextType.Function, this, params);
    }
    getBlockContext() {
        return new Context(this.programContext, this.filename, this.src, this.mode, ContextType.Block, this, this.params);
    }
    hasName(name) {
        return !!(this.boundNames.has(name) || this.parent && this.parent.hasName(name));
    }
    getName(name) {
        let i = 1;
        let n = name || 'anonymous';
        while (this.hasName(n)) {
            n = (name || 'anonymous') + '_' + i++;
        }
        this.boundNames.add(n);
        return n;
    }
    getError(msg, node) {
        const loc = node.loc;
        if (loc) {
            return new Error(msg + '\n\n' + codeFrameColumns(this.src, loc, {
                highlightCode: true
            }));
        } else {
            return new Error(msg);
        }
    }
    declare(id, declaration) {
        // We ignore "var"s lack of block scoping because it's really silly
        const d = this.declarations.get(id.name) || [];
        this.declarations.set(id.name, d);
        this.boundNames.add(id.name);
        d.push(declaration);
    }
    _setDefaultExport(value) {
        if (this.type === ContextType.Block) {
            return this.parent._setDefaultExport(value);
        }
        this.defaultExport = value;
    }
    setDefaultExport(value) {
        this._setDefaultExport({
            context: this,
            expression: value
        });
    }
    _setCommonJSExport(value) {
        if (this.type === ContextType.Block) {
            return this.parent._setCommonJSExport(value);
        }
        this.commonJSExport = value;
    }
    setCommonJSExport(value) {
        this._setCommonJSExport({
            context: this,
            expression: value
        });
    }
    _setReturnValue(value) {
        if (this.type === ContextType.Block) {
            return this.parent._setReturnValue(value);
        }
        this.returnValues.push(value);
    }
    setReturnValue(value) {
        this._setReturnValue({
            context: this,
            expression: value
        });
    }
    _addNamedExport(exportName, local) {
        if (this.type === ContextType.Block) {
            return this.parent._addNamedExport(exportName, local);
        }
        this.namedExports.set(exportName, local);
    }
    addNamedExport(exportName, localName) {
        this._addNamedExport(exportName, { localName, context: this });
    }
    addExportAll(relativePath) {
        if (this.type === ContextType.Block) {
            return this.parent.addExportAll(relativePath);
        }
        this.exportAlls.push(relativePath);
    }
    getRawDeclarations(name) {
        const rawDeclarations = this.declarations.get(name) || [];
        if (rawDeclarations.some(d => d.type === 'DeclareFunction' || d.type === 'TSDeclareFunction')) {
            return rawDeclarations.filter(d => d.type !== 'FunctionDeclaration');
        }
        return rawDeclarations;
    }
    useIdentifierInExport(name) {
        let cached = this.outputDeclarationsByName[name];
        // TODO: what if we're in a block/function (shouldn't really happen)
        if (cached) {
            return cached;
        }
        const rawDeclarations = this.getRawDeclarations(name);
        const declarations = rawDeclarations.map(d => getNormalizedDeclaration_1.default(d, this));
        if (cached = this.outputDeclarationsByName[name]) {
            return cached;
        }
        this.outputDeclarationsByName[name] = declarations;
        return declarations;
    }
    getTypeFromIdentifier(identifier) {
        const name = identifier.name;
        const loc = identifier.loc && new types_1.SourceLocation(identifier.loc);
        if (this.type === ContextType.File) {
            this.useIdentifierInExport(name);
            return {
                kind: types_1.TypeKind.Reference,
                name,
                loc,
                filename: this.filename
            };
        }
        const rawDeclarations = this.getRawDeclarations(name);
        if (rawDeclarations && rawDeclarations.length) {
            const types = rawDeclarations.map(d => getNormalizedDeclaration_1.default(d, this)).map(d => getTypeFromDeclaration_1.default(d, this));
            if (types.length === 1) {
                return types[0];
            } else {
                return {
                    kind: types_1.TypeKind.Intersection,
                    types,
                    loc
                };
            }
        }
        return this.parent.getTypeFromIdentifier(identifier);
    }
    getResolvedTypeFromIdentifier(identifier) {
        if (identifier.filename !== this.filename) {
            return this.programContext.parse(identifier.filename).getResolvedTypeFromIdentifier(identifier);
        }
        const name = identifier.name;
        const loc = identifier.loc;
        const rawDeclarations = this.getRawDeclarations(name);
        if (rawDeclarations && rawDeclarations.length) {
            const types = rawDeclarations.map(d => getNormalizedDeclaration_1.default(d, this)).map(d => getTypeFromDeclaration_1.default(d, this));
            if (types.length === 1) {
                return types[0];
            } else {
                return {
                    kind: types_1.TypeKind.Intersection,
                    types,
                    loc
                };
            }
        }
        if (this.parent) {
            return this.parent.getResolvedTypeFromIdentifier(identifier);
        }
    }
    getTypeOfIdentifierValue(identifier) {
        const name = identifier.name;
        const loc = identifier.loc && new types_1.SourceLocation(identifier.loc);
        if (this.type === ContextType.File) {
            this.useIdentifierInExport(name);
            return {
                kind: types_1.TypeKind.TypeOf,
                name,
                loc,
                filename: this.filename
            };
        }
        const rawDeclarations = this.getRawDeclarations(name);
        if (rawDeclarations && rawDeclarations.length) {
            const types = rawDeclarations.map(d => getNormalizedDeclaration_1.default(d, this)).map(d => getTypeOfDeclarationValue_1.default(d, this));
            if (types.length === 1) {
                return types[0];
            } else {
                return {
                    kind: types_1.TypeKind.Intersection,
                    types,
                    loc
                };
            }
        }
        if (this.params) {
            for (const p of this.params) {
                if (p.name && p.name === name) {
                    return p.type;
                }
            }
        }
        return this.parent.getTypeOfIdentifierValue(identifier);
    }
    getResolvedTypeOfIdentifierValue(identifier) {
        if (identifier.filename !== this.filename) {
            return this.programContext.parse(identifier.filename).getResolvedTypeOfIdentifierValue(identifier);
        }
        const name = identifier.name;
        const loc = identifier.loc;
        const rawDeclarations = this.getRawDeclarations(name);
        if (rawDeclarations && rawDeclarations.length) {
            const types = rawDeclarations.map(d => getNormalizedDeclaration_1.default(d, this)).map(d => getTypeOfDeclarationValue_1.default(d, this));
            if (types.length === 1) {
                return types[0];
            } else {
                return {
                    kind: types_1.TypeKind.Intersection,
                    types,
                    loc
                };
            }
        }
        if (this.params) {
            for (const p of this.params) {
                if (p.name && p.name === name) {
                    return p.type;
                }
            }
        }
        if (this.parent) {
            return this.parent.getResolvedTypeOfIdentifierValue(identifier);
        }
    }
    addExportStatement(statement) {
        this.outputExportStatements.push(statement);
    }
    toJSON() {
        return {
            declarationsByName: this.outputDeclarationsByName,
            exportStatements: this.outputExportStatements
        };
    }
    _tryResolve(relativePath) {
        const basedir = path_1.dirname(this.filename);
        // TODO: builtins?
        if (this.mode === types_1.Mode.typescript) {
            const packageFilter = pkg => {
                if (pkg.types) {
                    pkg.main = pkg.types;
                }
                return pkg;
            };
            try {
                let filename = resolve_1.sync(relativePath, {
                    basedir,
                    extensions: ['.d.ts', '.ts'],
                    packageFilter
                });
                if (/\.js$/.test(filename)) {
                    filename = filename.replace(/\.js$/, '.d.ts');
                }
                return fs_1.realpathSync(filename);
            } catch (ex) {
                if (relativePath[0] !== '.') {
                    try {
                        const filename = resolve_1.sync('@types/' + relativePath, {
                            basedir,
                            extensions: ['.d.ts', '.ts']
                        });
                        return fs_1.realpathSync(filename);
                    } catch (ex) {}
                }
            }
            return null;
        }
        try {
            const filename = resolve_1.sync(relativePath, {
                basedir,
                extensions: ['.js.flow', '.js']
            });
            return fs_1.realpathSync(filename);
        } catch (ex) {}
        return null;
    }
    tryResolve(relativePath) {
        const cached = this._resolveCache[relativePath];
        if (cached !== undefined) {
            return cached;
        }
        return this._resolveCache[relativePath] = this._tryResolve(relativePath);
    }
}
exports.default = Context;
//# sourceMappingURL=Context.js.map