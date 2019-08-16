import {
  Expression as BabelExpression,
  ReturnStatement,
  Identifier,
  ExportSpecifier,
  ExportAllDeclaration,
} from '@babel/types';
import FileContext from '@typeconvert/file-context';
import Declaration from './types/Declaration';
import RawScope from './RawScope';
import WalkResult from './WalkResult';
import RawScopedValue from './RawScopedValue';

export class RootWalkContext extends FileContext {
  private readonly exports: {
    readonly commonJS: RawScopedValue<BabelExpression>[];
    readonly default: RawScopedValue<Declaration | BabelExpression>[];
    readonly named: {
      [name: string]:
        | RawScopedValue<Declaration | ExportSpecifier>[]
        | undefined;
    };
    readonly exportAll: RawScopedValue<ExportAllDeclaration>[];
  } = {
    commonJS: [],
    default: [],
    named: {},
    exportAll: [],
  };
  private readonly returns: RawScopedValue<ReturnStatement>[] = [];

  addCommonJSExport(expression: RawScopedValue<BabelExpression>) {
    this.exports.commonJS.push(expression);
  }
  addDefaultExport(expression: RawScopedValue<Declaration | BabelExpression>) {
    this.exports.default.push(expression);
  }
  addExportAll(exportAll: RawScopedValue<ExportAllDeclaration>) {
    this.exports.exportAll.push(exportAll);
  }

  addNamedExport(declaration: RawScopedValue<Declaration | ExportSpecifier>) {
    const exports = this.exports.named[name] || [];
    this.exports.named[name] = exports;
    exports.push(declaration);
  }
  addReturn(statement: RawScopedValue<ReturnStatement>) {
    this.returns.push(statement);
  }

  getResult(): WalkResult {
    return {
      filename: this.filename,
      src: this.src,
      exports: this.exports,
      returns: this.returns,
    };
  }

  getContext(): WalkContext {
    return new WalkContext(this);
  }
}

export default class WalkContext extends FileContext {
  private readonly root: RootWalkContext;
  private readonly declarations: {
    [name: string]: Declaration[] | undefined;
  } = {};
  public readonly scope: RawScope;
  constructor(root: RootWalkContext, parent?: WalkContext) {
    super(root.filename, root.src, root.mode);
    this.root = root;
    this.scope = {
      parent: parent ? parent.scope : undefined,
      declarations: this.declarations,
      filename: root.filename,
    };
  }

  addDeclaration(identifier: Identifier, declaration: Declaration) {
    const name = identifier.name;
    const declarations = this.declarations[name] || [];
    this.declarations[name] = declarations;
    declarations.push(declaration);
    return declaration;
  }
  addCommonJSExport(expression: BabelExpression) {
    this.root.addCommonJSExport({
      value: expression,
      scope: this.scope,
    });
  }
  addDefaultExport(expression: Declaration | BabelExpression) {
    this.root.addDefaultExport({
      value: expression,
      scope: this.scope,
    });
  }
  addExportAll(exportAll: ExportAllDeclaration) {
    this.root.addExportAll({
      value: exportAll,
      scope: this.scope,
    });
  }
  addNamedExport(declaration: Declaration | ExportSpecifier) {
    this.root.addNamedExport({
      value: declaration,
      scope: this.scope,
    });
  }
  addReturn(statement: ReturnStatement) {
    this.root.addReturn({
      value: statement,
      scope: this.scope,
    });
  }
  getBlockContext() {
    return new WalkContext(this.root, this);
  }
}
