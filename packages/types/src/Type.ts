import { TypeScopeEntry } from './ScopeEntry'; 
import Variance from './Variance';

export enum TypeKind {
  Any = 'AnyType',
  Function = 'FunctionType',
  Intersection = 'IntersectionType',
  Number = 'NumberType',
  Object = 'ObjectType',
  String = 'StringType',
  Reference = 'ReferenceType',
  TypeOf = 'TypeOfType',
  Void = 'VoidType',
}

export interface AnyType {
  kind: TypeKind.Any;
}
export interface ObjectType {
  kind: TypeKind.Object;
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
export interface TypeOfType {
  kind: TypeKind.TypeOf;
  name: string;
}

export interface FunctionType {
  kind: TypeKind.Function;
  overloads: FunctionOverload[];
}
export interface FunctionOverload {
  parameters: FunctionParameter[];
  returns: TypeScopeEntry;
}
export interface FunctionParameter {
  name?: string;
  type: TypeScopeEntry;
  isRest: boolean;
}
export interface IntersectionType {
  kind: TypeKind.Intersection;
  types: Type[];
}
export interface NumberType {
  kind: TypeKind.Number;
}
export interface StringType {
  kind: TypeKind.String;
}
export interface VoidType {
  kind: TypeKind.Void;
}
export type Type =
  | AnyType
  | FunctionType
  | IntersectionType
  | NumberType
  | ObjectType
  | StringType
  | ReferenceType
  | TypeOfType
  | VoidType;
export default Type;
