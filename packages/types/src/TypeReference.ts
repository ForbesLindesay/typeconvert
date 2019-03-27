import Type from './Type';
import SourceLocation from './SourceLocation';

export enum TypeReferenceKind {
  /**
   * Example:
   *
   *     type value = string | number | {x: string}
   */
  RawType = 'RawType',
  /**
   * Example:
   *
   *     type x = string;
   *     type value = x;
   */
  LocalVariable = 'LocalVariable',
  /**
   * Example:
   *
   *     type x = {foo: string};
   *     type value = x.foo;
   */
  QualifiedTypeReference = 'QualifiedTypeReference',
  /**
   * Example:
   *
   *     import x from './x';
   *     type value = x;
   */
  ModuleExport = 'ModuleExport',
}
export interface RawTypeReference {
  kind: TypeReferenceKind.RawType;
  type: Type;
  loc: SourceLocation | null;
}

// N.B. these should not be created within a function scope
export interface LocalVariableReference {
  kind: TypeReferenceKind.LocalVariable;
  name: string;
  filename: string;
  type: TypeReference;
  loc: SourceLocation | null;
}
export interface QualifiedTypeReference {
  kind: TypeReferenceKind.QualifiedTypeReference;
  property: string;
  object: TypeReference;
  loc: SourceLocation | null;
}
export enum ModuleExportKind {
  Named = 'NamedExport',
  Default = 'DefaultExport',
  CommonJS = 'CommonJSExport',
}
export interface NamedModuleExport {
  kind: ModuleExportKind.Named;
  name: string;
}
export interface DefaultModuleExport {
  kind: ModuleExportKind.Default;
}
export interface CommonJSModuleExport {
  kind: ModuleExportKind.CommonJS;
}
export type ModuleExport =
  | NamedModuleExport
  | DefaultModuleExport
  | CommonJSModuleExport;

export interface ModuleExportReference {
  kind: TypeReferenceKind.ModuleExport;
  export: ModuleExport;
  filename: string;
  type: TypeReference;
  loc: SourceLocation | null;
}

export type TypeReference =
  | RawTypeReference
  | LocalVariableReference
  | QualifiedTypeReference
  | ModuleExportReference;

export default TypeReference;
