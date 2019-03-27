import {readFileSync} from 'fs';
import * as bt from '@babel/types';
import {
  Declaration,
  Mode,
  TypeReference,
  TypeReferenceKind,
  SourceLocation,
} from '@typeconvert/types';
import walk from '../walk';
import RawDeclaration from '../walk/RawDeclaration';
import WalkResult from '../walk/WalkResult';
import parseSource from '../babylon';
import getNormalizedDeclarationUncached from './getNormalizedDeclarationUncached';
import RawScope from '../walk/RawScope';
import Waitable, {DeepWaitable, DeeperWaitable} from '../utils/Waitable';
import WaitableCache from '../utils/WaitableCache';
import getTypeFromDeclarationUncached from './getTypeFromDeclarationUncached';
import getTypeOfBabelTypeUncached from './getTypeOfBabelTypeUncached';
import getTypeOfDeclarationValueUncached from './getTypeOfDeclarationValueUncached';
import {InferScopeContext} from './InferScopeContext';

export class InferProgramContext {
  public readonly mode: Mode;
  private readonly parseCache: Map<string, WalkResult> = new Map();
  private readonly scopeContexts: Map<RawScope, InferScopeContext> = new Map();
  private readonly declarations = new WaitableCache<
    RawDeclaration,
    Declaration
  >();
  private readonly declarationLists = new WaitableCache<
    ReadonlyArray<RawDeclaration>,
    Declaration[]
  >();
  private readonly declarationTypes = new WaitableCache<
    DeepWaitable<Declaration[]>,
    TypeReference | null
  >();
  private readonly declarationValueTypes = new WaitableCache<
    DeepWaitable<Declaration[]>,
    TypeReference | null
  >();
  private readonly parsedTypes = new WaitableCache<
    bt.FlowType | bt.TSType,
    TypeReference
  >();
  constructor(mode: Mode) {
    this.mode = mode;
  }
  getScopeContext(scope: RawScope): InferScopeContext {
    const cached = this.scopeContexts.get(scope);
    if (cached) {
      return cached;
    }
    const file = this._parseFile(scope.filename);
    const ctx = new InferScopeContext(file, this);
    this.scopeContexts.set(scope, ctx);
    return ctx;
  }
  private _parseFile(filename: string): WalkResult {
    const cached = this.parseCache.get(filename);
    if (cached) {
      return cached;
    }
    const src = readFileSync(filename, 'utf8');
    const ast = parseSource(src, {mode: this.mode});
    const walkResult = walk(ast, filename, src, this.mode);
    this.parseCache.set(filename, walkResult);
    return walkResult;
  }
  getExports(filename: string) {
    const walkResult = this._parseFile(filename);
    const scope = new InferScopeContext(walkResult, this);
    // TODO: convert all the exports into TypeReference nodes
    // const result = {
    //   commonJSValue: new Waitable(() => {
    //     return this.getType walkResult.exports.commonJS
    //   }),
    // };
    return {walkResult, scope};
  }

  normalizeDeclaration(
    rawDeclaration: RawDeclaration,
    scope: RawScope,
  ): DeepWaitable<Declaration> {
    const ctx = this.getScopeContext(scope);
    return this.declarations.getValue(
      rawDeclaration,
      () => getNormalizedDeclarationUncached(rawDeclaration, ctx),
      rawDeclaration.loc,
      ctx,
    );
  }
  private _getRawDeclarationsFromScope(
    name: string,
    scope: RawScope,
  ): ReadonlyArray<RawDeclaration> | undefined {
    while (scope.parent && !scope.declarations[name]) {
      scope = scope.parent;
    }
    const rawDeclarations = scope.declarations[name];
    if (!rawDeclarations) {
      return undefined;
    }
    if (
      rawDeclarations.some(d => d.type === 'FunctionDeclaration') &&
      rawDeclarations.some(
        d => d.type === 'DeclareFunction' || d.type === 'TSDeclareFunction',
      )
    ) {
      return (scope.declarations[name] = rawDeclarations.filter(
        d => d.type !== 'FunctionDeclaration',
      ));
    }
    return rawDeclarations;
  }

  private _getDeclarationsFromName(
    name: string,
    loc: bt.Node['loc'],
    scope: RawScope,
  ): DeepWaitable<Declaration[]> {
    const ctx = this.getScopeContext(scope);
    const rawDeclarations = this._getRawDeclarationsFromScope(name, scope);
    if (!rawDeclarations) {
      throw ctx.getError('Could not resolve identifier ' + name, {loc});
    }
    return this.declarationLists.getValue(rawDeclarations, () =>
      rawDeclarations.map(rawDeclaration =>
        this.normalizeDeclaration(rawDeclaration, scope),
      ),
    );
  }

  private _tryResolveIdentifier(
    identifier: bt.Identifier,
    scope: RawScope,
    mode: 'type' | 'value',
  ): DeepWaitable<TypeReference | null> {
    const declarations = this._getDeclarationsFromName(
      identifier.name,
      identifier.loc,
      scope,
    );
    const cache =
      mode === 'type' ? this.declarationTypes : this.declarationValueTypes;
    return cache.getValue(declarations, () => {
      const d = declarations.getValue();
      const types = d
        .map((declaration): DeeperWaitable<TypeReference | null> => {
          const d = Waitable.resolve(declaration);
          return mode === 'type'
            ? getTypeFromDeclarationUncached(d, this.getScopeContext(scope))
            : getTypeOfDeclarationValueUncached(d, this.getScopeContext(scope));
        })
        .filter((type): type is NonNullable<typeof type> => type != null);
      if (types.length === 0) {
        return null;
      }
      // TODO: how do we intersect types we don't have yet?
      //       we don't want to go any deeper than we have to
      //       to figure out if the intersection can be simplified.
      if (types.length === 1) {
        return types[0];
      }
      this.getScopeContext(scope).assertNever(
        'Multiple types for a single variable is not yet supported',
        types[0],
      );
      return null;
    });
    // return intersectTypes(identifier.loc, );
  }
  private _resolveIdentifier(
    identifier: bt.Identifier,
    scope: RawScope,
    mode: 'type' | 'value',
  ): DeepWaitable<TypeReference> {
    const ctx = this.getScopeContext(scope);
    const result = this._tryResolveIdentifier(identifier, scope, mode);
    return result.then(result => {
      if (!result) {
        throw ctx.getError(
          identifier.name +
            ' is being used as a ' +
            mode +
            ', but it refers to a ' +
            (mode === 'type' ? 'value' : 'type') +
            '.',
          identifier,
        );
      }
      return result;
    });
    // return intersectTypes(identifier.loc, );
  }
  tryGetTypeFromIdentifier(
    identifier: bt.Identifier,
    scope: RawScope,
  ): DeepWaitable<TypeReference | null> {
    return this._tryResolveIdentifier(identifier, scope, 'type');
  }
  getTypeFromIdentifier(
    identifier: bt.Identifier | bt.QualifiedTypeIdentifier,
    scope: RawScope,
  ): DeepWaitable<TypeReference> {
    if (bt.isQualifiedTypeIdentifier(identifier)) {
      const object = this.getTypeFromIdentifier(
        identifier.qualification,
        scope,
      );
      return new Waitable<DeeperWaitable<TypeReference>>(
        () => ({
          kind: TypeReferenceKind.QualifiedTypeReference,
          object,
          property: identifier.id.name,
          loc: new SourceLocation(identifier.loc!),
        }),
        identifier.loc,
      );
    }
    return this._resolveIdentifier(identifier, scope, 'type');
  }
  tryGetTypeOfValueOfIdentifier(
    identifier: bt.Identifier,
    scope: RawScope,
  ): DeepWaitable<TypeReference | null> {
    return this._tryResolveIdentifier(identifier, scope, 'value');
  }
  getTypeOfValueOfIdentifier(
    identifier: bt.Identifier,
    scope: RawScope,
  ): DeepWaitable<TypeReference> {
    return this._resolveIdentifier(identifier, scope, 'value');
  }
  getTypeOfBabelType(
    babelType: bt.FlowType | bt.TSType,
    ctx: InferScopeContext,
  ): DeepWaitable<TypeReference> {
    return this.parsedTypes.getValue(
      babelType,
      () => getTypeOfBabelTypeUncached(babelType, ctx),
      babelType.loc,
      ctx,
    );
  }
}
