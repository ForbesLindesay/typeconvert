import Comment from './Comment';
import SourceLocation from './SourceLocation';

export default interface NodeBase {
  readonly loc: SourceLocation | null;
  readonly leadingComments: ReadonlyArray<Comment>;
}
