import {SourceLocation} from '@typeconvert/file-context';
import Comment from './Comment';

export default interface DeclarationBase {
  readonly localName: string;
  readonly loc: SourceLocation | null;
  readonly leadingComments: ReadonlyArray<Comment> | null;
};
