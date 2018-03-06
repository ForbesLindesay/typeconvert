import CUID from './CUID';
import Import from './Import';
import Type from './Type';

export enum ScopeEntryKind {
  Type = 'TypeScopeEntry',
  Value = 'ValueScopeEntry',
}

export interface TypeScopeEntry {
  kind: ScopeEntryKind.Type;
  id: CUID;
  type: Type;
  localName?: string;
  source?: Import;
}
export interface ValueScopeEntry {
  kind: ScopeEntryKind.Value;
  id: CUID;
  valueType: Type;
  localName?: string;
  source?: Import;
}
export type ScopeEntry = TypeScopeEntry | ValueScopeEntry;
export default ScopeEntry;
