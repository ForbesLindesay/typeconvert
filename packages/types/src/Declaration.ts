import FunctionParam from './FunctionParam';
import SourceLocation from './SourceLocation';
import TypeReference from './TypeReference';
import Variance from './Variance';

export enum DeclarationKind {
  ImportDefault = 'ImportDefault',
  ImportNamed = 'ImportNamed',
  ImportNamespace = 'ImportNamespace',
  ImportCommonJS = 'ImportCommonJS',
  VariableDeclaration = 'VariableDeclaration',
  FunctionDeclaration = 'FunctionDeclaration',
  TypeAlias = 'TypeAlias',
  Interface = 'Interface',
}

export interface Comment {
  type: 'BlockComment' | 'LineComment';
  value: string;
}

export interface DeclarationBase {
  leadingComments: Comment[];
  localName: string;
  loc: SourceLocation | null;
}

export interface ImportDefaultDeclaration extends DeclarationBase {
  kind: DeclarationKind.ImportDefault;
  relativePath: string;
  filename: string;
}

export interface ImportNamedDeclaration extends DeclarationBase {
  kind: DeclarationKind.ImportNamed;
  importName: string;
  relativePath: string;
  filename: string;
}

export interface ImportNamespaceDeclaration extends DeclarationBase {
  kind: DeclarationKind.ImportNamespace;
  relativePath: string;
  filename: string;
}

export interface ImportCommonJSDeclaration extends DeclarationBase {
  kind: DeclarationKind.ImportCommonJS;
  relativePath: string;
  filename: string;
}

export enum VariableDeclarationMode {
  var = 'var',
  let = 'let',
  const = 'const',
}

export interface VariableDeclaration extends DeclarationBase {
  kind: DeclarationKind.VariableDeclaration;
  mode: VariableDeclarationMode;
  typeAnnotation: TypeReference;
}

export interface FunctionDeclaration extends DeclarationBase {
  kind: DeclarationKind.FunctionDeclaration;
  params: FunctionParam[];
  restParam?: FunctionParam;
  returnType: TypeReference;
  typeParameters: TypeParameter[];
}

export interface TypeParameter {
  name: string;
  variance: Variance;
  extends?: TypeReference;
  default?: TypeReference;
  loc: SourceLocation | null;
}

export interface TypeAliasDeclaration extends DeclarationBase {
  kind: DeclarationKind.TypeAlias;
  typeParameters: TypeParameter[];
  right: TypeReference;
}

export interface InterfaceDeclaration extends DeclarationBase {
  kind: DeclarationKind.Interface;
  typeParameters: TypeParameter[];
  extends: TypeReference[];
  // TODO: body
}

// export interface ClassDeclaration extends DeclarationBase {
//   type: 'ClassDeclaration';
//   id: Identifier;
//   superClass: Expression;
//   body: ClassBody;
//   decorators?: Decorator[];
//   implements?: ClassImplements[];
//   mixins?: any[];
//   typeParameters: TypeParameterDeclaration;
//   superTypeParameters?: TypeParameterInstantiation;
// }

export type Declaration =
  | FunctionDeclaration
  | ImportDefaultDeclaration
  | ImportNamedDeclaration
  | ImportNamespaceDeclaration
  | ImportCommonJSDeclaration
  | VariableDeclaration
  | FunctionDeclaration
  | TypeAliasDeclaration
  | InterfaceDeclaration;

export default Declaration;
