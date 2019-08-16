import { SourceLocation } from '@typeconvert/file-context';
import TypeAnnotation from './TypeAnnotation';
import Variance from './Variance';
import Identifier from './ExpressionTypes/Identifier';
export default interface TypeParameter {
    id: Identifier | undefined;
    bound: TypeAnnotation | undefined;
    default: TypeAnnotation | undefined;
    variance: Variance;
    loc: SourceLocation;
}
