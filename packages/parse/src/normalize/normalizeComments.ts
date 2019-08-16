import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';

export default function normalizeComments(
  ...comments: Array<readonly bt.Comment[] | null>
): ast.Comment[] {
  return comments
    .map(c => {
      if (c) {
        return c.map(
          (comment): ast.Comment => {
            return {
              kind:
                comment.type === 'CommentBlock'
                  ? ast.CommentKind.CommentBlock
                  : ast.CommentKind.CommentLine,
              value: comment.value,
              loc: comment.loc,
            };
          },
        );
      } else {
        return [];
      }
    })
    .reduce((a, b) => [...a, ...b], []);
}
