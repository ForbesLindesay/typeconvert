import { Mode, Module } from '@typeconvert/types';
import Context from './Context';
export interface Options {
    mode: Mode;
}
export interface Modules {
    [filename: string]: Module | undefined;
}
export default class ProgramContext {
    readonly parsedFiles: Modules;
    readonly fileContexts: Map<string, Context>;
    readonly mode: Mode;
    constructor(options: Options);
    parse(filename: string): Context;
}
