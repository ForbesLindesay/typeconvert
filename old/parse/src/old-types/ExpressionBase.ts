import {SourceLocation} from '@typeconvert/file-context';

export default interface ExpressionBase {
  readonly loc: SourceLocation | null;
};
