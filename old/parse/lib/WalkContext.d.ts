import { Expression as BabelExpression, ReturnStatement, Identifier, ExportSpecifier, ExportAllDeclaration } from '@babel/types';
import FileContext from '@typeconvert/file-context';
import Declaration from './types/Declaration';
import RawScope from './RawScope';
import WalkResult from './WalkResult';
import RawScopedValue from './RawScopedValue';
export declare class RootWalkContext extends FileContext {
    private readonly exports;
    private readonly returns;
    addCommonJSExport(expression: RawScopedValue<BabelExpression>): void;
    addDefaultExport(expression: RawScopedValue<Declaration | BabelExpression>): void;
    addExportAll(exportAll: RawScopedValue<ExportAllDeclaration>): void;
    addNamedExport(declaration: RawScopedValue<Declaration | ExportSpecifier>): void;
    addReturn(statement: RawScopedValue<ReturnStatement>): void;
    getResult(): WalkResult;
    getContext(): WalkContext;
}
export default class WalkContext extends FileContext {
    private readonly root;
    private readonly declarations;
    readonly scope: RawScope;
    constructor(root: RootWalkContext, parent?: WalkContext);
    addDeclaration(identifier: Identifier, declaration: Declaration): Declaration;
    addCommonJSExport(expression: BabelExpression): void;
    addDefaultExport(expression: Declaration | BabelExpression): void;
    addExportAll(exportAll: ExportAllDeclaration): void;
    addNamedExport(declaration: Declaration | ExportSpecifier): void;
    addReturn(statement: ReturnStatement): void;
    getBlockContext(): WalkContext;
}
