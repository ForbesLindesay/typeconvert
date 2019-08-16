"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const { codeFrameColumns } = require('@babel/code-frame');
var Status;
(function (Status) {
    Status[Status["Pending"] = 0] = "Pending";
    Status[Status["Fulfilled"] = 1] = "Fulfilled";
    Status[Status["Rejected"] = 2] = "Rejected";
})(Status || (Status = {}));
class Waitable {
    constructor(getValue, loc, ctx) {
        this._state = { status: Status.Pending };
        this._getValue = getValue;
        this._loc = loc;
        this._ctx = ctx;
    }
    getValue() {
        switch (this._state.status) {
            case Status.Pending:
                try {
                    const getValue = this._getValue;
                    this._getValue = undefined;
                    if (!getValue) {
                        const err = new Error('Unable to resolve cyclic dependency');
                        err._waitableCycle = [];
                        throw err;
                    }
                    const value = getValue();
                    this._state = { status: Status.Fulfilled, value };
                    return value;
                } catch (error) {
                    const waitableCycle = error._waitableCycle;
                    if (waitableCycle) {
                        if (waitableCycle.indexOf(this) !== -1) {
                            error._waitableCycle = undefined;
                        } else {
                            waitableCycle.push(this);
                            if (this._loc && this._ctx) {
                                error.message += '\n\n' + codeFrameColumns(this._ctx.src, this._loc, {
                                    highlightCode: Waitable.highlightCodeInErrors
                                });
                            }
                        }
                    }
                    this._state = { status: Status.Rejected, error };
                    throw error;
                }
            case Status.Fulfilled:
                return this._state.value;
            case Status.Rejected:
                throw this._state.error;
        }
    }
    getValueDeep() {
        return Waitable.resolveDeep(this.getValue());
    }
    then(fn) {
        return new Waitable(() => {
            const result = fn(this.getValue());
            if (result instanceof Waitable) {
                return result.getValue();
            } else {
                return result;
            }
        });
    }
    thenDeep(fn) {
        return new Waitable(() => {
            const result = fn(this.getValueDeep());
            if (result instanceof Waitable) {
                return result.getValue();
            } else {
                return result;
            }
        });
    }
    static resolve(value) {
        if (value instanceof Waitable) {
            return value.getValue();
        } else {
            return value;
        }
    }
    static resolveDeep(value) {
        // the slightly odd data structure is to be able to handle recursive structures:
        // e.g.
        // const x = new Waitable(() => 10);
        // const y = {x};
        // y.y = y;
        // const z = new Waitable(() => y);
        // Waitable.resolveDeep(z);
        const cache = new Map();
        function recurse(value, onResult) {
            const cached = cache.get(value);
            if (cached) {
                if (cached.completed) {
                    onResult(cached.value);
                } else {
                    cached.pending.push(onResult);
                }
                return;
            }
            const pending = [onResult];
            cache.set(value, { completed: false, pending });
            onResult = result => {
                cache.set(value, { completed: true, value: result });
                pending.forEach(p => p(result));
            };
            if (value instanceof Waitable) {
                recurse(value.getValue(), onResult);
                return;
            }
            if (Array.isArray(value)) {
                const result = new Array(value.length);
                value.forEach((value, i) => {
                    recurse(value, value => result[i] = value);
                });
                onResult(result);
                return;
            }
            if (value && typeof value === 'object') {
                const result = {};
                for (const key in value) {
                    recurse(value[key], value => result[key] = value);
                }
                onResult(result);
                return;
            }
            onResult(value);
        }
        let result;
        recurse(value, v => result = v);
        return result;
    }
}
Waitable.highlightCodeInErrors = true;
exports.default = Waitable;
//# sourceMappingURL=Waitable.js.map