import {Node, Comment as BabelComment} from '@babel/types';
import Comment, {CommentKind} from './types/Comment';
import FileContext from '@typeconvert/file-context/src';

export {Comment};
function getCommentKind(comment: BabelComment, ctx: FileContext) {
  switch (comment.type) {
    case 'CommentBlock':
      return CommentKind.CommentBlock;
    case 'CommentLine':
      return CommentKind.CommentLine;
    default:
      return ctx.assertNever(
        `Unrecognised comment type ${(comment as any).type}`,
        comment,
      );
  }
}
export default function getComments(node: Node, ctx: FileContext) {
  return (node.leadingComments || []).map((c): Comment => ({
    kind: getCommentKind(c, ctx),
    value: c.value,
    loc: c.loc,
  }));
}
