import {SourceLocation} from '@typeconvert/file-context';
import TypeAnnotation from './TypeAnnotation';
import Variance from './Variance';
import TypeIdentifier from './TypeAnnotationTypes/TypeIdentifier';

export default interface TypeParameter {
  id: TypeIdentifier | undefined;
  bound: TypeAnnotation | undefined;
  default: TypeAnnotation | undefined;
  variance: Variance;
  loc: SourceLocation;
};
