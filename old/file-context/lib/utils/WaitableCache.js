"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const Waitable_1 = require("./Waitable");
class WaitableCache {
    constructor() {
        this._values = new Map();
    }
    getValue(input, getValue, loc, ctx) {
        const cached = this._values.get(input);
        if (cached) {
            return cached;
        }
        const result = new Waitable_1.default(getValue, loc, ctx);
        this._values.set(input, result);
        return result;
    }
}
exports.default = WaitableCache;
//# sourceMappingURL=WaitableCache.js.map