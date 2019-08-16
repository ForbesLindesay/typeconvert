import SourceLocation from './SourceLocation';

export enum CommentKind {
  CommentBlock = 'CommentBlock',
  CommentLine = 'CommentLine',
}

export interface Comment {
  readonly kind: CommentKind;
  readonly value: string;
  readonly loc: SourceLocation;
}
export default Comment;
