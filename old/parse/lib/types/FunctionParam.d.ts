import { SourceLocation } from '@typeconvert/file-context';
import TypeAnnotation from './TypeAnnotation';
import Identifier from './ExpressionTypes/Identifier';
export default interface FunctionParam {
    id: Identifier | undefined;
    type: TypeAnnotation | undefined;
    optional: boolean;
    loc: SourceLocation;
}
