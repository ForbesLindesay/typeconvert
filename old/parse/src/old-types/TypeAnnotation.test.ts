import * as ta from 'type-assertions';
import TypeAnnotation from './TypeAnnotation';
import TypeAnnotationKind from './TypeAnnotationKind';
import TypeAnnotationBase from './TypeAnnotationBase';

export type t1 = ta.Assert<
  ta.Equal<Pick<TypeAnnotation, 'kind'>, {readonly kind: TypeAnnotationKind}>
>;
export type t2 = ta.Assert<ta.Extends<TypeAnnotation, TypeAnnotationBase>>;
