import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';
import TypeIdentifier from './TypeIdentifier';

/**
 * TypeScript:
 *
 *     type ElementOf<T extends Array<any>> =
 *       T extend Array<infer T>
 *       ? T
 *       : never;
 */
export default interface InferTypeAnnotation extends TypeAnnotationBase {
  kind: TypeAnnotationKind.InferTypeAnnotation;
  id: TypeIdentifier;
};
