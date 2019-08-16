import TypeAnnotation from './types/TypeAnnotation';
declare type BuiltInTypeMapping<T extends {
    [key: string]: BuiltInType;
}> = T & {
    [key in keyof T]: BuiltInType;
};
declare class BuiltInType {
    readonly parse: (t: TypeAnnotation) => null | {
        flow: TypeAnnotation;
        typescript: TypeAnnotation;
    };
    constructor(parse: (t: TypeAnnotation) => null | {
        flow: TypeAnnotation;
        typescript: TypeAnnotation;
    });
}
declare const mapping: {
    'NodeJS.ErrnoException': BuiltInType;
};
declare const BuiltInTypes: BuiltInTypeMapping<typeof mapping>;
export default BuiltInTypes;
