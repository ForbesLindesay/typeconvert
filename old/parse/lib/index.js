"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WalkContext_1 = require("./WalkContext");
const walkStatement_1 = require("./walkStatement");
function walk(ast, filename, src, mode) {
    const ctx = new WalkContext_1.RootWalkContext(filename, src, mode);
    const scope = ctx.getContext();
    ast.program.body.forEach(statement => walkStatement_1.default(statement, scope));
    return ctx.getResult();
}
exports.default = walk;
//# sourceMappingURL=index.js.map