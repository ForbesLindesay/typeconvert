import * as bt from '@babel/types';
import ProgramContext from './ProgramContext';
import { Declaration, ExportStatement, Mode, Module, Type, FunctionParam, ReferenceType, TypeOfType } from '@typeconvert/types';
import { RawDeclaration } from './walk/RawDeclaration';
export declare enum ContextType {
    File = "File",
    Function = "Function",
    Block = "Block"
}
export interface ExportedExpression {
    expression: bt.Expression;
    context: Context;
}
export interface ExportedName {
    localName: string;
    context: Context;
}
export default class Context {
    readonly programContext: ProgramContext;
    readonly filename: string;
    readonly src: string;
    readonly declarations: Map<string, Array<RawDeclaration>>;
    readonly boundNames: Set<string>;
    defaultExport: null | ExportedExpression;
    commonJSExport: null | ExportedExpression;
    readonly namedExports: Map<string, ExportedName>;
    readonly returnValues: ExportedExpression[];
    readonly exportAlls: string[];
    readonly mode: Mode;
    readonly type: ContextType;
    readonly parent: void | Context;
    readonly params: FunctionParam[];
    constructor(programContext: ProgramContext, filename: string, src: string, mode: Mode, type?: ContextType, parent?: Context, params?: FunctionParam[]);
    getImport(relativePath: string): void;
    getFunctionContext(params: FunctionParam[]): Context;
    getBlockContext(): Context;
    hasName(name: string): boolean;
    getName(name: string): string;
    getError(msg: string, node: {
        loc: bt.Node['loc'];
    }): Error;
    declare(id: bt.Identifier, declaration: RawDeclaration): void;
    _setDefaultExport(value: ExportedExpression): void;
    setDefaultExport(value: bt.Expression): void;
    _setCommonJSExport(value: ExportedExpression): void;
    setCommonJSExport(value: bt.Expression): void;
    _setReturnValue(value: ExportedExpression): void;
    setReturnValue(value: bt.Expression): void;
    _addNamedExport(exportName: string, local: ExportedName): void;
    addNamedExport(exportName: string, localName: string): void;
    addExportAll(relativePath: string): void;
    readonly outputDeclarationsByName: {
        [key: string]: Declaration[];
    };
    readonly outputExportStatements: ExportStatement[];
    private getRawDeclarations;
    useIdentifierInExport(name: string): Declaration[];
    getTypeFromIdentifier(identifier: bt.Identifier): Type;
    getResolvedTypeFromIdentifier(identifier: ReferenceType): Type | void;
    getTypeOfIdentifierValue(identifier: bt.Identifier): Type;
    getResolvedTypeOfIdentifierValue(identifier: TypeOfType): Type | void;
    addExportStatement(statement: ExportStatement): void;
    toJSON(): Module;
    private _tryResolve;
    private _resolveCache;
    tryResolve(relativePath: string): string | null;
}
