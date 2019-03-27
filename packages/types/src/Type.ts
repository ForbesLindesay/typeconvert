import FunctionParam from './FunctionParam';
import Variance from './Variance';
import {TypeParameter} from './Declaration';
import SourceLocation from './SourceLocation';
import TypeReference from './TypeReference';

export interface TypeBase {
  loc: SourceLocation | null;
}

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
  Tuple = 'TupleType',
  TypeOf = 'TypeOfType',
  TypeParameterReference = 'TypeParameterReferenceType',
  Union = 'UnionType',
  Void = 'VoidType',
}

export interface AnyType extends TypeBase {
  kind: TypeKind.Any;
}
export interface BooleanType extends TypeBase {
  kind: TypeKind.Boolean;
}
export interface BooleanLiteralType extends TypeBase {
  kind: TypeKind.BooleanLiteral;
  value: boolean;
}
export interface GenericType extends TypeBase {
  kind: TypeKind.Generic;
  typeParameters: TypeParameter[];
  type: TypeReference;
}
export interface GenericApplicationType extends TypeBase {
  kind: TypeKind.GenericApplication;
  type: TypeReference;
  params: TypeReference[];
}
export interface NullType extends TypeBase {
  kind: TypeKind.Null;
}
export interface ObjectType extends TypeBase {
  kind: TypeKind.Object;
  exact: boolean;
  properties: ObjectProperty[];
  callProperties: FunctionType[];
}
export interface ObjectProperty extends TypeBase {
  name: string;
  optional: boolean;
  type: TypeReference;
  variance: Variance;
}
export interface StringLiteralType extends TypeBase {
  kind: TypeKind.StringLiteral;
  value: string;
}
export interface TupleType extends TypeBase {
  kind: TypeKind.Tuple;
  types: TypeReference[];
}
export interface UnionType extends TypeBase {
  kind: TypeKind.Union;
  types: TypeReference[];
}

export interface FunctionType extends TypeBase {
  kind: TypeKind.Function;
  params: FunctionParam[];
  restParam?: FunctionParam;
  returnType: TypeReference;
  typeParameters: TypeParameter[];
}
export interface IntersectionType extends TypeBase {
  kind: TypeKind.Intersection;
  types: TypeReference[];
}
export interface NumberType extends TypeBase {
  kind: TypeKind.Number;
}
export interface NumericLiteralType extends TypeBase {
  kind: TypeKind.NumericLiteral;
  value: number;
}
export interface StringType extends TypeBase {
  kind: TypeKind.String;
}
export interface TypeParameterReferenceType extends TypeBase {
  kind: TypeKind.TypeParameterReference;
  param: TypeParameter;
}
export interface VoidType extends TypeBase {
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
  | StringLiteralType
  | StringType
  | TupleType
  | TypeParameterReferenceType
  | UnionType
  | VoidType;

export default Type;
