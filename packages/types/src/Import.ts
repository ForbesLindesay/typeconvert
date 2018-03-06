export enum ImportKind {
  Named = 'NamedImport',
  Default = 'DefaultImport',
  CommonJS = 'CommonJSImport',
}
export interface NamedImport {
  kind: ImportKind.Named;
  name: string;
  relativePath: string;
}
export interface DefaultImport {
  kind: ImportKind.Default;
  relativePath: string;
}
export interface CommonJSImport {
  kind: ImportKind.CommonJS;
  relativePath: string;
}

export type Import = NamedImport | DefaultImport | CommonJSImport;
export default Import;