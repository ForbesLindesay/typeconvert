"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Comment_1 = require("./types/Comment");
function getCommentKind(comment, ctx) {
    switch (comment.type) {
        case 'CommentBlock':
            return Comment_1.CommentKind.CommentBlock;
        case 'CommentLine':
            return Comment_1.CommentKind.CommentLine;
        default:
            return ctx.assertNever(`Unrecognised comment type ${comment.type}`, comment);
    }
}
function getComments(node, ctx) {
    return (node.leadingComments || []).map((c) => ({
        kind: getCommentKind(c, ctx),
        value: c.value,
        loc: c.loc,
    }));
}
exports.default = getComments;
//# sourceMappingURL=getComments.js.map