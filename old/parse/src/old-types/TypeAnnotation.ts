import AnyTypeAnnotation from './TypeAnnotationTypes/AnyTypeAnnotation';
import ArrayTypeAnnotation from './TypeAnnotationTypes/ArrayTypeAnnotation';
import BooleanTypeAnnotation from './TypeAnnotationTypes/BooleanTypeAnnotation';
import LiteralTypeAnnotation from './TypeAnnotationTypes/LiteralTypeAnnotation';
import ExistsTypeAnnotation from './TypeAnnotationTypes/ExistsTypeAnnotation';
import FunctionTypeAnnotation from './TypeAnnotationTypes/FunctionTypeAnnotation';
import TypeReferenceAnnotation from './TypeAnnotationTypes/TypeReferenceAnnotation';
import IntersectionTypeAnnotation from './TypeAnnotationTypes/IntersectionTypeAnnotation';
import UnknownTypeAnnotation from './TypeAnnotationTypes/UnknownTypeAnnotation';
import EmptyTypeAnnotation from './TypeAnnotationTypes/EmptyTypeAnnotation';
import NumberTypeAnnotation from './TypeAnnotationTypes/NumberTypeAnnotation';
import StringTypeAnnotation from './TypeAnnotationTypes/StringTypeAnnotation';
import TupleTypeAnnotation from './TypeAnnotationTypes/TupleTypeAnnotation';
import ThisTypeAnnotation from './TypeAnnotationTypes/ThisTypeAnnotation';
import InferTypeAnnotation from './TypeAnnotationTypes/InferTypeAnnotation';
import UnionTypeAnnotation from './TypeAnnotationTypes/UnionTypeAnnotation';
import TypeofTypeAnnotation from './TypeAnnotationTypes/TypeofTypeAnnotation';
import ImportTypeAnnotation from './TypeAnnotationTypes/ImportTypeAnnotation';
import ObjectTypeAnnotation from './TypeAnnotationTypes/ObjectTypeAnnotation';
import SymbolTypeAnnotation from './TypeAnnotationTypes/SymbolTypeAnnotation';

type TypeAnnotation =
  | AnyTypeAnnotation
  | ArrayTypeAnnotation
  | BooleanTypeAnnotation
  | LiteralTypeAnnotation
  | ExistsTypeAnnotation
  | FunctionTypeAnnotation
  | TypeReferenceAnnotation
  // | InterfaceTypeAnnotation
  | IntersectionTypeAnnotation
  | UnknownTypeAnnotation
  | EmptyTypeAnnotation
  // | NullableTypeAnnotation
  | NumberTypeAnnotation
  | ObjectTypeAnnotation
  | SymbolTypeAnnotation
  | StringTypeAnnotation
  | ThisTypeAnnotation
  | TupleTypeAnnotation
  // | TypeofTypeAnnotation
  | UnionTypeAnnotation
  // | VoidTypeAnnotation
  | InferTypeAnnotation
  | TypeofTypeAnnotation
  | ImportTypeAnnotation;
export default TypeAnnotation;
