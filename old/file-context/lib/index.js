"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const types_1 = require("@typeconvert/types");
exports.Mode = types_1.Mode;
const code_frame_1 = require("@babel/code-frame");
class FileContext {
    constructor(filename, src, mode) {
        this.filename = filename;
        this.src = src;
        this.mode = mode;
    }
    getError(msg, node) {
        const loc = node && node.loc;
        if (loc) {
            return new Error(msg + '\n\n' + code_frame_1.codeFrameColumns(this.src, loc, {
                highlightCode: true
            }));
        } else {
            return new Error(msg);
        }
    }
    throwErrror(msg, node) {
        throw this.getError(msg, node);
    }
    assert(condition, msg, node) {
        if (condition !== true) {
            throw this.getError(msg, node);
        }
    }
    assertNever(msg, value) {
        const v = value;
        if (typeof v === 'object' && typeof v.loc === 'object' && v.loc) {
            throw this.getError(msg, v);
        }
        throw new Error(msg + ' in ' + this.filename);
    }
}
exports.default = FileContext;
//# sourceMappingURL=index.js.map