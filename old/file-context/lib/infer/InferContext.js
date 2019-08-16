"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const bt = require("@babel/types");
const types_1 = require("@typeconvert/types");
const FileContext_1 = require("../FileContext");
const walk_1 = require("../walk");
const babylon_1 = require("../babylon");
const getNormalizedDeclarationUncached_1 = require("./getNormalizedDeclarationUncached");
const Waitable_1 = require("../utils/Waitable");
const WaitableCache_1 = require("../utils/WaitableCache");
const getTypeFromDeclarationUncached_1 = require("./getTypeFromDeclarationUncached");
const getTypeOfBabelTypeUncached_1 = require("./getTypeOfBabelTypeUncached");
const getTypeOfDeclarationValueUncached_1 = require("./getTypeOfDeclarationValueUncached");
class InferProgramContext {
    constructor(mode) {
        this.parseCache = new Map();
        this.scopeContexts = new Map();
        this.declarations = new WaitableCache_1.default();
        this.declarationLists = new WaitableCache_1.default();
        this.declarationTypes = new WaitableCache_1.default();
        this.declarationValueTypes = new WaitableCache_1.default();
        this.parsedTypes = new WaitableCache_1.default();
        this.mode = mode;
    }
    getScopeContext(scope) {
        const cached = this.scopeContexts.get(scope);
        if (cached) {
            return cached;
        }
        const file = this._parseFile(scope.filename);
        const ctx = new InferScopeContext(scope, file.src, this);
        this.scopeContexts.set(scope, ctx);
        return ctx;
    }
    _parseFile(filename) {
        const cached = this.parseCache.get(filename);
        if (cached) {
            return cached;
        }
        const src = fs_1.readFileSync(filename, 'utf8');
        const ast = babylon_1.default(src, { mode: this.mode });
        const walkResult = walk_1.default(ast, filename, src, this.mode);
        this.parseCache.set(filename, walkResult);
        return walkResult;
    }
    getExports(filename) {
        const walkResult = this._parseFile(filename);
        // TODO: convert all the exports into TypeReference nodes
    }
    normalizeDeclaration(rawDeclaration, scope) {
        const ctx = this.getScopeContext(scope);
        return this.declarations.getValue(rawDeclaration, () => getNormalizedDeclarationUncached_1.default(rawDeclaration, ctx), rawDeclaration.loc, ctx);
    }
    _getRawDeclarationsFromScope(name, scope) {
        while (scope.parent && !scope.declarations[name]) {
            scope = scope.parent;
        }
        const rawDeclarations = scope.declarations[name];
        if (!rawDeclarations) {
            return undefined;
        }
        if (rawDeclarations.some(d => d.type === 'FunctionDeclaration') && rawDeclarations.some(d => d.type === 'DeclareFunction' || d.type === 'TSDeclareFunction')) {
            return scope.declarations[name] = rawDeclarations.filter(d => d.type !== 'FunctionDeclaration');
        }
        return rawDeclarations;
    }
    _getDeclarationsFromName(name, loc, scope) {
        const ctx = this.getScopeContext(scope);
        const rawDeclarations = this._getRawDeclarationsFromScope(name, scope);
        if (!rawDeclarations) {
            throw ctx.getError('Could not resolve identifier ' + name, { loc });
        }
        return this.declarationLists.getValue(rawDeclarations, () => rawDeclarations.map(rawDeclaration => this.normalizeDeclaration(rawDeclaration, scope)));
    }
    _tryResolveIdentifier(identifier, scope, mode) {
        const declarations = this._getDeclarationsFromName(identifier.name, identifier.loc, scope);
        const cache = mode === 'type' ? this.declarationTypes : this.declarationValueTypes;
        return cache.getValue(declarations, () => {
            const d = declarations.getValue();
            const types = d.map(declaration => {
                const d = Waitable_1.default.resolve(declaration);
                return mode === 'type' ? getTypeFromDeclarationUncached_1.default(d, this.getScopeContext(scope)) : getTypeOfDeclarationValueUncached_1.default(d, this.getScopeContext(scope));
            }).filter(type => type != null);
            if (types.length === 0) {
                return null;
            }
            // TODO: how do we intersect types we don't have yet?
            //       we don't want to go any deeper than we have to
            //       to figure out if the intersection can be simplified.
            if (types.length === 1) {
                return types[0];
            }
            this.getScopeContext(scope).assertNever('Multiple types for a single variable is not yet supported', types[0]);
            return null;
        });
        // return intersectTypes(identifier.loc, );
    }
    _resolveIdentifier(identifier, scope, mode) {
        const ctx = this.getScopeContext(scope);
        const result = this._tryResolveIdentifier(identifier, scope, mode);
        return result.then(result => {
            if (!result) {
                throw ctx.getError(identifier.name + ' is being used as a ' + mode + ', but it refers to a ' + (mode === 'type' ? 'value' : 'type') + '.', identifier);
            }
            return result;
        });
        // return intersectTypes(identifier.loc, );
    }
    tryGetTypeFromIdentifier(identifier, scope) {
        return this._tryResolveIdentifier(identifier, scope, 'type');
    }
    getTypeFromIdentifier(identifier, scope) {
        if (bt.isQualifiedTypeIdentifier(identifier)) {
            const object = this.getTypeFromIdentifier(identifier.qualification, scope);
            return new Waitable_1.default(() => ({
                kind: types_1.TypeReferenceKind.QualifiedTypeReference,
                object,
                property: identifier.id.name,
                loc: new types_1.SourceLocation(identifier.loc)
            }), identifier.loc);
        }
        return this._resolveIdentifier(identifier, scope, 'type');
    }
    tryGetTypeOfValueOfIdentifier(identifier, scope) {
        return this._tryResolveIdentifier(identifier, scope, 'value');
    }
    getTypeOfValueOfIdentifier(identifier, scope) {
        return this._resolveIdentifier(identifier, scope, 'value');
    }
    getTypeOfBabelType(babelType, ctx) {
        return this.parsedTypes.getValue(babelType, () => getTypeOfBabelTypeUncached_1.default(babelType, ctx), babelType.loc, ctx);
    }
}
exports.InferProgramContext = InferProgramContext;
class InferScopeContext extends FileContext_1.default {
    constructor(scope, src, programContext) {
        super(scope.filename, src, programContext.mode);
        this.programContext = programContext;
        this.scope = scope;
    }
    getTypeOfBabelType(babelType) {
        return this.programContext.getTypeOfBabelType(babelType, this);
    }
}
exports.InferScopeContext = InferScopeContext;
//# sourceMappingURL=InferContext.js.map