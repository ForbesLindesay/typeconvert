import NodeKind from '../NodeKind';
import NodeBase from '../NodeBase';
import TypeIdentifier from './Identifier';

/**
 * TypeScript:
 *
 *     type ElementOf<T extends Array<any>> =
 *       T extend Array<infer T>
 *       ? T
 *       : never;
 *
 * @alias TypeAnnotation
 */
export default interface InferTypeAnnotation extends NodeBase {
  kind: NodeKind.InferTypeAnnotation;
  id: TypeIdentifier;
};
