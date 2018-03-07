import FunctionParam from './FunctionParam';
import Variance from './Variance';
import {TypeParameter} from './Declaration';

export enum TypeKind {
  Any = 'AnyType',
  Boolean = 'BooleanType',
  BooleanLiteral = 'BooleanLiteralType',
  Function = 'FunctionType',
  Generic = 'GenericType',
  GenericApplication = 'GenericApplicationType',
  Intersection = 'IntersectionType',
  Null = 'NullType',
  Number = 'NumberType',
  NumericLiteral = 'NumericLiteralType',
  Object = 'ObjectType',
  StringLiteral = 'StringLiteralType',
  String = 'StringType',
  Reference = 'ReferenceType',
  Tuple = 'TupleType',
  TypeOf = 'TypeOfType',
  Union = 'UnionType',
  Void = 'VoidType',
}

export interface AnyType {
  kind: TypeKind.Any;
}
export interface BooleanType {
  kind: TypeKind.Boolean;
}
export interface BooleanLiteralType {
  kind: TypeKind.BooleanLiteral;
  value: boolean;
}
export interface GenericType {
  kind: TypeKind.Generic;
  typeParameters: TypeParameter[];
  type: Type;
}
export interface GenericApplicationType {
  kind: TypeKind.GenericApplication;
  type: Type;
  params: Type[];
}
export interface NullType {
  kind: TypeKind.Null;
}
export interface ObjectType {
  kind: TypeKind.Object;
  exact: boolean;
  properties: ObjectProperty[];
}
export interface ObjectProperty {
  name: string;
  optional: boolean;
  type: Type;
  variance: Variance;
}
export interface ReferenceType {
  kind: TypeKind.Reference;
  name: string;
}
export interface StringLiteralType {
  kind: TypeKind.StringLiteral;
  value: string;
}
export interface TupleType {
  kind: TypeKind.Tuple;
  types: Type[];
}
export interface TypeOfType {
  kind: TypeKind.TypeOf;
  name: string;
}
export interface UnionType {
  kind: TypeKind.Union;
  types: Type[];
}

export interface FunctionType {
  kind: TypeKind.Function;
  params: FunctionParam[];
  restParam?: FunctionParam;
  returnType: Type;
  typeParameters: TypeParameter[];
}
export interface IntersectionType {
  kind: TypeKind.Intersection;
  types: Type[];
}
export interface NumberType {
  kind: TypeKind.Number;
}
export interface NumericLiteralType {
  kind: TypeKind.NumericLiteral;
  value: number;
}
export interface StringType {
  kind: TypeKind.String;
}
export interface VoidType {
  kind: TypeKind.Void;
}
export type Type =
  | AnyType
  | BooleanType
  | BooleanLiteralType
  | FunctionType
  | GenericType
  | GenericApplicationType
  | IntersectionType
  | NullType
  | NumberType
  | NumericLiteralType
  | ObjectType
  | ReferenceType
  | StringLiteralType
  | StringType
  | TupleType
  | TypeOfType
  | UnionType
  | VoidType;

export default Type;
