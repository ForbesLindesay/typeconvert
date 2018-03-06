import {
  Declaration,
  Mode,
  Module,
  ExportStatement,
  ExportKind,
} from '@typeconvert/types';
import printDeclaration from './printDeclaration';

export default class Context {
  readonly exportStatements: ExportStatement[];
  readonly mode: Mode;
  private readonly declarationsByName: Module['declarationsByName'];

  private readonly printedDeclarations = new Set<string>();
  private readonly outputImports: string[] = [];
  private readonly outputDeclarations: string[] = [];
  private readonly outputExports: string[] = [];

  constructor(m: Module, mode: Mode) {
    this.exportStatements = m.exportStatements;
    this.declarationsByName = m.declarationsByName;
    this.mode = mode;
  }

  read(name: string): Declaration[] {
    const declarations = this.declarationsByName[name] || [];
    if (!this.printedDeclarations.has(name)) {
      this.printedDeclarations.add(name);
      declarations.forEach(d => {
        printDeclaration(d, this);
      });
    }
    return declarations;
  }

  pushImport(src: string) {
    this.outputImports.push(src);
  }

  pushDeclaration(src: string) {
    this.outputDeclarations.push(src);
  }

  pushExport(src: string) {
    this.outputExports.push(src);
  }

  toString() {
    const src = this.outputImports
      .concat(this.outputDeclarations)
      .concat(this.outputExports)
      .join('\n');
    if (this.mode === Mode.flow) {
      return '// @flow\n\n' + src;
    }
    return src;
  }
}
