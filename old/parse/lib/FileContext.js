"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const { codeFrameColumns } = require('@babel/code-frame');
class FileContext {
    constructor(filename, src, mode) {
        this.filename = filename;
        this.src = src;
        this.mode = mode;
    }
    getError(msg, node) {
        const loc = node.loc;
        if (loc) {
            return new Error(msg + '\n\n' + codeFrameColumns(this.src, loc, {
                highlightCode: true
            }));
        } else {
            return new Error(msg);
        }
    }
    // N.B. convert this back to `never` to expose errors
    assertNever(msg, value) {
        const v = value;
        if (typeof v === 'object' && typeof v.loc === 'object' && v.loc) {
            throw this.getError(msg, v);
        }
        throw new Error(msg + ' in ' + this.filename);
    }
}
exports.default = FileContext;
//# sourceMappingURL=FileContext.js.map