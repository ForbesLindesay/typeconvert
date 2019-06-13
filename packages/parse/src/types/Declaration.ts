import DeclarationKind from './DeclarationKind';
import ImportDeclaration from './DeclarationTypes/ImportDeclaration';
import LocalDeclaration from './DeclarationTypes/LocalDeclaration';

export {DeclarationKind};

export type Declaration = ImportDeclaration | LocalDeclaration;

export default Declaration;
