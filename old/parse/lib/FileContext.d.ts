import * as bt from '@babel/types';
import { Mode } from '@typeconvert/types';
export default class FileContext {
    readonly filename: string;
    readonly src: string;
    readonly mode: Mode;
    constructor(filename: string, src: string, mode: Mode);
    getError(msg: string, node: {
        loc: bt.Node['loc'];
    }): Error;
    assertNever(msg: string, value: any): never;
}
