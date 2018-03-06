import * as bt from '@babel/types';
import RawDeclaration from './RawDeclaration';
import {
  Declaration,
  ExportStatement,
  Mode,
  Module,
  Type,
  TypeKind,
} from '@typeconvert/types';
import getNormalizedDeclaration from './getNormalizedDeclaration';
import getTypeFromDeclaration from './getTypeFromDeclaration';
import getTypeOfDeclarationValue from './getTypeOfDeclarationValue';
const {codeFrameColumns} = require('@babel/code-frame');

// TODO: merge with output context, but also add notion of a "Function Context"
//
// Function Context should:
//  1. Store a separate set of identifiers that are declared
//  2. track `returnValues` instead of exports
//  3. Resolve identifiers to their type or value type (depending on context)
//     instead of just returning the identifier.
//  4. Still return just the identifier if it resolves to a parent context
//
// We can then simply call `getTypeOfExpression` on the return arg with a mode
// of function to get the return type of an un-annotated function

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

  constructor(
    filename: string,
    src: string,
    mode: Mode,
    type: ContextType = ContextType.File,
    parent?: Context,
  ) {
    this.filename = filename;
    this.src = src;
    this.mode = mode;
    this.type = type;
    this.parent = parent;
  }
  getFunctionContext(): Context {
    return new Context(
      this.filename,
      this.src,
      this.mode,
      ContextType.Function,
      this,
    );
  }

  getBlockContext(): Context {
    return new Context(
      this.filename,
      this.src,
      this.mode,
      ContextType.Block,
      this,
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

  readonly outputDeclarationsByName: Map<string, Declaration[]> = new Map();
  readonly outputExportStatements: ExportStatement[] = [];
  useIdentifierInExport(name: string) {
    let cached = this.outputDeclarationsByName.get(name);
    // TODO: what if we're in a block/function (shouldn't really happen)
    if (cached) {
      return cached;
    }
    const declarations = (this.declarations.get(name) || []).map(d =>
      getNormalizedDeclaration(d, this),
    );
    if ((cached = this.outputDeclarationsByName.get(name))) {
      return cached;
    }
    this.outputDeclarationsByName.set(name, declarations);
    return declarations;
  }
  getTypeFromIdentifier(name: string): Type {
    if (this.type === ContextType.File) {
      this.useIdentifierInExport(name);
      return {
        kind: TypeKind.Reference,
        name,
      };
    }
    const rawDeclarations = this.declarations.get(name);
    if (!rawDeclarations) {
      return this.parent!.getTypeFromIdentifier(name);
    }
    const types = rawDeclarations
      .map(d => getNormalizedDeclaration(d, this))
      .map(d => getTypeFromDeclaration(d, this));

    if (types.length === 1) {
      return types[0];
    } else {
      return {
        kind: TypeKind.Intersection,
        types,
      };
    }
  }
  getTypeOfIdentifierValue(name: string): Type {
    if (this.type === ContextType.File) {
      this.useIdentifierInExport(name);
      return {
        kind: TypeKind.TypeOf,
        name,
      };
    }
    const rawDeclarations = this.declarations.get(name);
    if (!rawDeclarations) {
      return this.parent!.getTypeOfIdentifierValue(name);
    }
    const types = rawDeclarations
      .map(d => getNormalizedDeclaration(d, this))
      .map(d => getTypeOfDeclarationValue(d, this));

    if (types.length === 1) {
      return types[0];
    } else {
      return {
        kind: TypeKind.Intersection,
        types,
      };
    }
  }

  addExportStatement(statement: ExportStatement) {
    this.outputExportStatements.push(statement);
  }

  toJSON(): Module {
    const declarationsByName: Module['declarationsByName'] = {};
    this.outputDeclarationsByName.forEach((declarations, name) => {
      declarationsByName[name] = declarations;
    });
    return {
      declarationsByName,
      exportStatements: this.outputExportStatements,
    };
  }
}
