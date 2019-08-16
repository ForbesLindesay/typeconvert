"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const types_1 = require("@typeconvert/types");
const Waitable_1 = require("./Waitable");
const FileContext_1 = require("../FileContext");
test('Waitable.resolveDeep - circular', () => {
    const x = new Waitable_1.default(() => 10);
    const y = { x };
    y.y = y;
    const z = new Waitable_1.default(() => y);
    const expected = { x: 10 };
    expected.y = expected;
    expect(Waitable_1.default.resolveDeep(z)).toEqual(expected);
});
test('Waitable.resolveDeep - types', () => {
    const x = new Waitable_1.default(() => 10);
    const y = { x };
    const z = new Waitable_1.default(() => y);
    const expected = { x: 10 };
    const result = Waitable_1.default.resolveDeep(z);
    expect(result).toEqual(expected);
});
test('waitable.getValue() -> cyclic dependency error', () => {
    const x = new Waitable_1.default(() => y.getValue(), {
        start: {
            line: 1,
            column: 0
        },
        end: {
            line: 1,
            column: 10
        }
    }, new FileContext_1.default(__filename, fs_1.readFileSync(__filename, 'utf8'), types_1.Mode.typescript));
    const y = new Waitable_1.default(() => z.getValue(), {
        start: {
            line: 2,
            column: 0
        },
        end: {
            line: 2,
            column: 10
        }
    }, new FileContext_1.default(__filename, fs_1.readFileSync(__filename, 'utf8'), types_1.Mode.typescript));
    const z = new Waitable_1.default(() => x.getValue(), {
        start: {
            line: 3,
            column: 0
        },
        end: {
            line: 3,
            column: 10
        }
    }, new FileContext_1.default(__filename, fs_1.readFileSync(__filename, 'utf8'), types_1.Mode.typescript));
    const a = new Waitable_1.default(() => x.getValue(), {
        start: {
            line: 42,
            column: 0
        },
        end: {
            line: 42,
            column: 10
        }
    }, new FileContext_1.default(__filename, fs_1.readFileSync(__filename, 'utf8'), types_1.Mode.typescript));
    Waitable_1.default.highlightCodeInErrors = false;
    expect(() => a.getValue()).toThrowErrorMatchingSnapshot();
    expect(() => a.getValue()).toThrowErrorMatchingSnapshot();
    Waitable_1.default.highlightCodeInErrors = true;
});
//# sourceMappingURL=Waitable.test.js.map