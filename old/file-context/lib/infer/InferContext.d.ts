import * as bt from '@babel/types';
import { Declaration, Mode, TypeReference } from '@typeconvert/types';
import FileContext from '../FileContext';
import RawDeclaration from '../walk/RawDeclaration';
import RawScope from '../walk/RawScope';
import { DeepWaitable } from '../utils/Waitable';
export declare class InferProgramContext {
    readonly mode: Mode;
    private readonly parseCache;
    private readonly scopeContexts;
    private readonly declarations;
    private readonly declarationLists;
    private readonly declarationTypes;
    private readonly declarationValueTypes;
    private readonly parsedTypes;
    constructor(mode: Mode);
    getScopeContext(scope: RawScope): InferScopeContext;
    private _parseFile;
    getExports(filename: string): void;
    normalizeDeclaration(rawDeclaration: RawDeclaration, scope: RawScope): DeepWaitable<Declaration>;
    private _getRawDeclarationsFromScope;
    private _getDeclarationsFromName;
    private _tryResolveIdentifier;
    private _resolveIdentifier;
    tryGetTypeFromIdentifier(identifier: bt.Identifier, scope: RawScope): DeepWaitable<TypeReference | null>;
    getTypeFromIdentifier(identifier: bt.Identifier | bt.QualifiedTypeIdentifier, scope: RawScope): DeepWaitable<TypeReference>;
    tryGetTypeOfValueOfIdentifier(identifier: bt.Identifier, scope: RawScope): DeepWaitable<TypeReference | null>;
    getTypeOfValueOfIdentifier(identifier: bt.Identifier, scope: RawScope): DeepWaitable<TypeReference>;
    getTypeOfBabelType(babelType: bt.FlowType | bt.TSType, ctx: InferScopeContext): DeepWaitable<TypeReference>;
}
export declare class InferScopeContext extends FileContext {
    readonly programContext: InferProgramContext;
    readonly scope: RawScope;
    constructor(scope: RawScope, src: string, programContext: InferProgramContext);
    getTypeOfBabelType(babelType: bt.FlowType | bt.TSType): DeepWaitable<TypeReference>;
}
