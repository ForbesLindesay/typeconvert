import * as bt from '@babel/types';
import {Mode} from '@typeconvert/types';
const {codeFrameColumns} = require('@babel/code-frame');

export default class FileContext {
  readonly filename: string;
  readonly src: string;
  readonly mode: Mode;

  constructor(filename: string, src: string, mode: Mode) {
    this.filename = filename;
    this.src = src;
    this.mode = mode;
  }

  getError(msg: string, node: {loc: bt.Node['loc']}) {
    const loc = node.loc;
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

  // N.B. convert this back to `never` to expose errors
  assertNever(msg: string, value: never): never {
    const v: any = value;
    if (typeof v === 'object' && typeof v.loc === 'object' && v.loc) {
      throw this.getError(msg, v);
    }
    throw new Error(msg + ' in ' + this.filename);
  }
}
