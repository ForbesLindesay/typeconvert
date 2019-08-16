import DeclarationKind from '../DeclarationKind';
import DeclarationBase from '../DeclaraitonBase';
export declare enum ImportSetKind {
    ImportDefault = "ImportDefault",
    ImportNamed = "ImportNamed",
    ImportNamespace = "ImportNamespace",
    ImportCommonJS = "ImportCommonJS"
}
export interface ImportDefaultDeclaration {
    kind: ImportSetKind.ImportDefault;
}
export interface ImportNamedDeclaration {
    kind: ImportSetKind.ImportNamed;
    importName: string;
}
export interface ImportNamespaceDeclaration {
    kind: ImportSetKind.ImportNamespace;
}
export interface ImportCommonJSDeclaration {
    kind: ImportSetKind.ImportCommonJS;
}
export declare type ImportSet = ImportDefaultDeclaration | ImportNamedDeclaration | ImportNamespaceDeclaration | ImportCommonJSDeclaration;
export interface ImportDeclaration extends DeclarationBase {
    kind: DeclarationKind.ImportDeclaration;
    relativePath: string;
    set: ImportSet;
}
export default ImportDeclaration;
