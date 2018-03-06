export enum ExportKind {
  Named = 'NamedExportStatement',
  Default = 'DefaultExportStatement',
  CommonJS = 'CommonJSExportStatement',
  ExportAll = 'ExportAllStatement',
}

export interface NamedExportStatement {
  kind: ExportKind.Named;
  exportedName: string;
  localName: string;
}

export interface DefaultExportStatement {
  kind: ExportKind.Default;
  localName: string;
}

export interface CommonJSExportStatement {
  kind: ExportKind.CommonJS;
  localName: string;
}

export interface ExportAllStatement {
  kind: ExportKind.ExportAll;
  relativePath: string;
}

export type ExportStatement =
  | NamedExportStatement
  | DefaultExportStatement
  | CommonJSExportStatement
  | ExportAllStatement;

export default ExportStatement;
