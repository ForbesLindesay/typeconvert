import * as bt from '@babel/types';
import {VariableDeclarationMode} from '@typeconvert/types';

export {VariableDeclarationMode};

export enum DeclarationType {
  ImportDefault = 'ImportDefault',
  ImportNamed = 'ImportNamed',
  ImportNamespace = 'ImportNamespace',
  ImportCommonJS = 'ImportCommonJS',
  VariableDeclaration = 'VariableDeclaration',
}

export interface DeclarationBase {
  localName: string;
  loc: bt.SourceLocation | null;
  leadingComments: ReadonlyArray<bt.Comment> | null;
}

export interface ImportDefaultDeclaration extends DeclarationBase {
  type: DeclarationType.ImportDefault;
  relativePath: string;
}

export interface ImportNamedDeclaration extends DeclarationBase {
  type: DeclarationType.ImportNamed;
  importName: string;
  relativePath: string;
}

export interface ImportNamespaceDeclaration extends DeclarationBase {
  type: DeclarationType.ImportNamespace;
  relativePath: string;
}

export interface ImportCommonJSDeclaration extends DeclarationBase {
  type: DeclarationType.ImportCommonJS;
  relativePath: string;
}

export interface VariableDeclaration extends DeclarationBase {
  type: DeclarationType.VariableDeclaration;
  mode: VariableDeclarationMode;
  typeAnnotation?: bt.TypeAnnotation | bt.TSTypeAnnotation;
  init?: bt.Expression;
}

export type RawDeclaration =
  | bt.FunctionDeclaration
  | bt.DeclareFunction
  | bt.InterfaceDeclaration
  | bt.DeclareInterface
  | bt.ClassDeclaration
  | bt.DeclareClass
  | bt.DeclareOpaqueType
  | bt.OpaqueType
  | bt.TypeAlias
  | bt.DeclareTypeAlias
  | bt.TSEnumDeclaration
  | bt.TSDeclareFunction
  | bt.TSTypeAliasDeclaration
  | bt.TSInterfaceDeclaration
  | ImportDefaultDeclaration
  | ImportNamedDeclaration
  | ImportNamespaceDeclaration
  | ImportCommonJSDeclaration
  | VariableDeclaration;

export default RawDeclaration;
