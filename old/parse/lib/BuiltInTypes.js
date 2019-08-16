"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const TypeAnnotationKind_1 = require("./types/TypeAnnotationKind");
const aliases = {
    'NodeJS.ErrnoException': 'ErrnoError',
    'NodeJS.ReadableStream': 'stream$Readable',
    'NodeJS.WritableStream': 'stream$Writable',
    Partial: '$Shape',
    PromiseLike: 'Promise',
};
class BuiltInType {
    constructor(parse) {
        this.parse = parse;
    }
}
const mapping = {
    'NodeJS.ErrnoException': new BuiltInType(t => {
        if (t.kind === TypeAnnotationKind_1.default.TypeReferenceAnnotation) {
        }
        return null;
    }),
};
const BuiltInTypes = mapping;
exports.default = BuiltInTypes;
//# sourceMappingURL=BuiltInTypes.js.map