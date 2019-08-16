export default interface SourceLocation {
  readonly start: {readonly line: number; readonly column?: number};
  readonly end?: {readonly line: number; readonly column?: number};
}