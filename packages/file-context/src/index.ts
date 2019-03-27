import {Mode} from '@typeconvert/types';
import {codeFrameColumns} from '@babel/code-frame';

export {Mode};
export interface SourceLocation {
  start: {line: number; column?: number};
  end?: {line: number; column?: number};
}
export type Node = {loc?: SourceLocation | null} | null | undefined;
export default class FileContext {
  readonly filename: string;
  readonly src: string;
  readonly mode: Mode;

  constructor(filename: string, src: string, mode: Mode) {
    this.filename = filename;
    this.src = src;
    this.mode = mode;
  }

  getError(msg: string, node: Node) {
    const loc = node && node.loc;
    if (loc) {
      return new Error(
        msg +
          '\n\n' +
          codeFrameColumns(this.src, loc, {
            highlightCode: true,
          }),
      );
    } else {
      return new Error(msg);
    }
  }

  throwErrror(msg: string, node: Node) {
    throw this.getError(msg, node);
  }

  assert(condition: any, msg: string, node: Node) {
    if (condition !== true) {
      throw this.getError(msg, node);
    }
  }

  assertNever(msg: string, value: never): never {
    const v: any = value;
    if (typeof v === 'object' && typeof v.loc === 'object' && v.loc) {
      throw this.getError(msg, v);
    }
    throw new Error(msg + ' in ' + this.filename);
  }
}
