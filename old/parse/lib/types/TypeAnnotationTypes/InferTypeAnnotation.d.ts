import Identifier from '../ExpressionTypes/Identifier';
import TypeAnnotationKind from '../TypeAnnotationKind';
import TypeAnnotationBase from '../TypeAnnotationBase';
export default interface InferTypeAnnotation extends TypeAnnotationBase {
    kind: TypeAnnotationKind.InferTypeAnnotation;
    id: Identifier;
}
