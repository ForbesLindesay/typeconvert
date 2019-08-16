// import {SourceLocation} from '@typeconvert/file-context';
// import ExpressionKind from './types/ExpressionKind';
// import Identifier from './types/ExpressionTypes/Identifier';
// import TypeAnnotation from './types/TypeAnnotation';
// import TypeAnnotationKind from './types/TypeAnnotationKind';

// const aliases: {[key: string]: string} = {
//   'NodeJS.ErrnoException': 'ErrnoError',
//   'NodeJS.ReadableStream': 'stream$Readable',
//   'NodeJS.WritableStream': 'stream$Writable',
//   Partial: '$Shape',
//   PromiseLike: 'Promise',

//   // Just use { [key: string]: any } as TypeScript equivalent to Object
// };

// type BuiltInTypeMapping<T extends {[key: string]: BuiltInType}> = T &
//   {[key in keyof T]: BuiltInType};

// class BuiltInType {
//   constructor(
//     public readonly parse: (
//       t: TypeAnnotation,
//     ) => null | {
//       flow: TypeAnnotation;
//       typescript: TypeAnnotation;
//     },
//   ) {}
// }

// const mapping = {
//   'NodeJS.ErrnoException': new BuiltInType(t => {
//     if (t.kind === TypeAnnotationKind.TypeReferenceAnnotation) {
//     }
//     return null;
//   }),
// };
// const BuiltInTypes: BuiltInTypeMapping<typeof mapping> = mapping;
// export default BuiltInTypes;
