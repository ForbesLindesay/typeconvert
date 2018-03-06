import {SourceLocation as BabelSourceLocation} from '@babel/types';

export interface Position {
  readonly line: number;
  readonly column: number;
}

export class SourceLocation {
  readonly start: Position;
  readonly end: Position;
  readonly filename: string | null;
  constructor(loc: BabelSourceLocation) {
    this.start = loc.start;
    this.end = loc.end;
    this.filename = (loc as any).filename || null;
  }
}
export default SourceLocation;
