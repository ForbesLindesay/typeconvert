import { Mode } from '@typeconvert/types';
export { Mode };
export interface SourceLocation {
    start: {
        line: number;
        column?: number;
    };
    end?: {
        line: number;
        column?: number;
    };
}
export declare type Node = {
    loc?: SourceLocation | null;
} | null | undefined;
export default class FileContext {
    readonly filename: string;
    readonly src: string;
    readonly mode: Mode;
    constructor(filename: string, src: string, mode: Mode);
    getError(msg: string, node: Node): Error;
    throwErrror(msg: string, node: Node): void;
    assert(condition: any, msg: string, node: Node): void;
    assertNever(msg: string, value: never): never;
}
