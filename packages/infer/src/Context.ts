import {dirname} from 'path';
import {realpathSync} from 'fs';
import * as bt from '@babel/types';
import {sync as resolve} from 'resolve';
import ProgramContext from './ProgramContext';
import {
  Declaration,
  ExportStatement,
  Mode,
  Module,
  Type,
  TypeKind,
  FunctionParam,
  SourceLocation,
  ReferenceType,
  TypeOfType,
} from '@typeconvert/types';
import getNormalizedDeclaration from './getNormalizedDeclaration';
import getTypeFromDeclaration from './getTypeFromDeclaration';
import getTypeOfDeclarationValue from './getTypeOfDeclarationValue';
import {RawDeclaration} from './walk/RawDeclaration';
const {codeFrameColumns} = require('@babel/code-frame');

export enum ContextType {
  File = 'File',
  Function = 'Function',
  Block = 'Block',
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

  readonly declarations: Map<string, Array<RawDeclaration>> = new Map();
  readonly boundNames: Set<string> = new Set();

  defaultExport: null | ExportedExpression = null;
  commonJSExport: null | ExportedExpression = null;
  // export name => local name
  readonly namedExports: Map<string, ExportedName> = new Map();
  readonly returnValues: ExportedExpression[] = [];
  readonly exportAlls: string[] = [];
  readonly mode: Mode;
  readonly type: ContextType;
  readonly parent: void | Context;
  readonly params: FunctionParam[];

  constructor(
    programContext: ProgramContext,
    filename: string,
    src: string,
    mode: Mode,
    type: ContextType = ContextType.File,
    parent?: Context,
    params?: FunctionParam[],
  ) {
    this.programContext = programContext;
    this.filename = filename;
    this.src = src;
    this.mode = mode;
    this.type = type;
    this.parent = parent;
    this.params = params || [];
  }
  getImport(relativePath: string) {}
  getFunctionContext(params: FunctionParam[]): Context {
    return new Context(
      this.programContext,
      this.filename,
      this.src,
      this.mode,
      ContextType.Function,
      this,
      params,
    );
  }

  getBlockContext(): Context {
    return new Context(
      this.programContext,
      this.filename,
      this.src,
      this.mode,
      ContextType.Block,
      this,
      this.params,
    );
  }

  hasName(name: string): boolean {
    return !!(
      this.boundNames.has(name) ||
      (this.parent && this.parent.hasName(name))
    );
  }
  getName(name: string) {
    let i = 1;
    let n = name || 'anonymous';
    while (this.hasName(n)) {
      n = (name || 'anonymous') + '_' + i++;
    }
    this.boundNames.add(n);
    return n;
  }

  getError(msg: string, node: {loc: bt.Node['loc']}) {
    const loc = node.loc;
    if (loc) {
      return new Error(
        msg +
          '\n\n' +
          codeFrameColumns(this.src, loc, {
            highlightCode: true,
          }),
      );
    } else {
      return new Error(msg);
    }
  }

  declare(id: bt.Identifier, declaration: RawDeclaration) {
    // We ignore "var"s lack of block scoping because it's really silly
    const d = this.declarations.get(id.name) || [];
    this.declarations.set(id.name, d);
    this.boundNames.add(id.name);
    d.push(declaration);
  }

  _setDefaultExport(value: ExportedExpression): void {
    if (this.type === ContextType.Block) {
      return this.parent!._setDefaultExport(value);
    }
    this.defaultExport = value;
  }
  setDefaultExport(value: bt.Expression): void {
    this._setDefaultExport({
      context: this,
      expression: value,
    });
  }

  _setCommonJSExport(value: ExportedExpression): void {
    if (this.type === ContextType.Block) {
      return this.parent!._setCommonJSExport(value);
    }
    this.commonJSExport = value;
  }
  setCommonJSExport(value: bt.Expression): void {
    this._setCommonJSExport({
      context: this,
      expression: value,
    });
  }

  _setReturnValue(value: ExportedExpression): void {
    if (this.type === ContextType.Block) {
      return this.parent!._setReturnValue(value);
    }
    this.returnValues.push(value);
  }
  setReturnValue(value: bt.Expression): void {
    this._setReturnValue({
      context: this,
      expression: value,
    });
  }

  _addNamedExport(exportName: string, local: ExportedName): void {
    if (this.type === ContextType.Block) {
      return this.parent!._addNamedExport(exportName, local);
    }
    this.namedExports.set(exportName, local);
  }
  addNamedExport(exportName: string, localName: string): void {
    this._addNamedExport(exportName, {localName, context: this});
  }

  addExportAll(relativePath: string): void {
    if (this.type === ContextType.Block) {
      return this.parent!.addExportAll(relativePath);
    }
    this.exportAlls.push(relativePath);
  }

  readonly outputDeclarationsByName: {[key: string]: Declaration[]} = {};
  readonly outputExportStatements: ExportStatement[] = [];
  private getRawDeclarations(name: string) {
    const rawDeclarations = this.declarations.get(name) || [];
    if (
      rawDeclarations.some(
        d => d.type === 'DeclareFunction' || d.type === 'TSDeclareFunction',
      )
    ) {
      return rawDeclarations.filter(d => d.type !== 'FunctionDeclaration');
    }
    return rawDeclarations;
  }
  useIdentifierInExport(name: string) {
    let cached = this.outputDeclarationsByName[name];
    // TODO: what if we're in a block/function (shouldn't really happen)
    if (cached) {
      return cached;
    }
    const rawDeclarations = this.getRawDeclarations(name);
    const declarations = rawDeclarations.map(d =>
      getNormalizedDeclaration(d, this),
    );
    if ((cached = this.outputDeclarationsByName[name])) {
      return cached;
    }
    this.outputDeclarationsByName[name] = declarations;
    return declarations;
  }
  getTypeFromIdentifier(identifier: bt.Identifier): Type {
    const name = identifier.name;
    const loc = identifier.loc && new SourceLocation(identifier.loc);
    if (this.type === ContextType.File) {
      this.useIdentifierInExport(name);
      return {
        kind: TypeKind.Reference,
        name,
        loc,
        filename: this.filename,
      };
    }
    const rawDeclarations = this.getRawDeclarations(name);
    if (rawDeclarations && rawDeclarations.length) {
      const types = rawDeclarations
        .map(d => getNormalizedDeclaration(d, this))
        .map(d => getTypeFromDeclaration(d, this));

      if (types.length === 1) {
        return types[0];
      } else {
        return {
          kind: TypeKind.Intersection,
          types,
          loc,
        };
      }
    }
    return this.parent!.getTypeFromIdentifier(identifier);
  }
  getResolvedTypeFromIdentifier(identifier: ReferenceType): Type | void {
    if (identifier.filename !== this.filename) {
      return this.programContext
        .parse(identifier.filename)
        .getResolvedTypeFromIdentifier(identifier);
    }
    const name = identifier.name;
    const loc = identifier.loc;
    const rawDeclarations = this.getRawDeclarations(name);
    if (rawDeclarations && rawDeclarations.length) {
      const types = rawDeclarations
        .map(d => getNormalizedDeclaration(d, this))
        .map(d => getTypeFromDeclaration(d, this));

      if (types.length === 1) {
        return types[0];
      } else {
        return {
          kind: TypeKind.Intersection,
          types,
          loc,
        };
      }
    }
    if (this.parent) {
      return this.parent.getResolvedTypeFromIdentifier(identifier);
    }
  }
  getTypeOfIdentifierValue(identifier: bt.Identifier): Type {
    const name = identifier.name;
    const loc = identifier.loc && new SourceLocation(identifier.loc);
    if (this.type === ContextType.File) {
      this.useIdentifierInExport(name);
      return {
        kind: TypeKind.TypeOf,
        name,
        loc,
        filename: this.filename,
      };
    }
    const rawDeclarations = this.getRawDeclarations(name);
    if (rawDeclarations && rawDeclarations.length) {
      const types = rawDeclarations
        .map(d => getNormalizedDeclaration(d, this))
        .map(d => getTypeOfDeclarationValue(d, this));

      if (types.length === 1) {
        return types[0];
      } else {
        return {
          kind: TypeKind.Intersection,
          types,
          loc,
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
    return this.parent!.getTypeOfIdentifierValue(identifier);
  }
  getResolvedTypeOfIdentifierValue(identifier: TypeOfType): Type | void {
    if (identifier.filename !== this.filename) {
      return this.programContext
        .parse(identifier.filename)
        .getResolvedTypeOfIdentifierValue(identifier);
    }
    const name = identifier.name;
    const loc = identifier.loc;
    const rawDeclarations = this.getRawDeclarations(name);
    if (rawDeclarations && rawDeclarations.length) {
      const types = rawDeclarations
        .map(d => getNormalizedDeclaration(d, this))
        .map(d => getTypeOfDeclarationValue(d, this));

      if (types.length === 1) {
        return types[0];
      } else {
        return {
          kind: TypeKind.Intersection,
          types,
          loc,
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

  addExportStatement(statement: ExportStatement) {
    this.outputExportStatements.push(statement);
  }

  toJSON(): Module {
    return {
      declarationsByName: this.outputDeclarationsByName,
      exportStatements: this.outputExportStatements,
    };
  }

  private _tryResolve(relativePath: string): string | null {
    const basedir = dirname(this.filename);

    // TODO: builtins?

    if (this.mode === Mode.typescript) {
      const packageFilter = (pkg: any) => {
        if (pkg.types) {
          pkg.main = pkg.types;
        }
        return pkg;
      };
      try {
        let filename = resolve(relativePath, {
          basedir,
          extensions: ['.d.ts', '.ts'],
          packageFilter,
        });
        if (/\.js$/.test(filename)) {
          filename = filename.replace(/\.js$/, '.d.ts');
        }
        return realpathSync(filename);
      } catch (ex) {
        if (relativePath[0] !== '.') {
          try {
            const filename = resolve('@types/' + relativePath, {
              basedir,
              extensions: ['.d.ts', '.ts'],
            });
            return realpathSync(filename);
          } catch (ex) {}
        }
      }
      return null;
    }

    try {
      const filename = resolve(relativePath, {
        basedir,
        extensions: ['.js.flow', '.js'],
      });
      return realpathSync(filename);
    } catch (ex) {}

    return null;
  }
  private _resolveCache: {
    [relativePath: string]: string | null | undefined;
  } = {};
  tryResolve(relativePath: string): string | null {
    const cached = this._resolveCache[relativePath];
    if (cached !== undefined) {
      return cached;
    }
    return (this._resolveCache[relativePath] = this._tryResolve(relativePath));
  }
}
