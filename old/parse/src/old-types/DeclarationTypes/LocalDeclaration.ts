import DeclarationKind from '../DeclarationKind';
import DeclarationBase from '../DeclaraitonBase';
import TypeAnnotation from '../TypeAnnotation';

export interface LocalDeclaration extends DeclarationBase {
  kind: DeclarationKind.LocalDeclaration;
  valueType?: TypeAnnotation;
  valueInit?: Expression;
  declaredType?: TypeAnnotation;
}
export default LocalDeclaration;
