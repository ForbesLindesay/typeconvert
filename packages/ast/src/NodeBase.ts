import {SourceLocation} from '@typeconvert/file-context';

export default interface NodeBase {
  readonly loc: SourceLocation | null;
  readonly leadingComments: ReadonlyArray<Comment>;
  readonly trailingComments: ReadonlyArray<Comment>;
  readonly innnerComments: ReadonlyArray<Comment>;
};
