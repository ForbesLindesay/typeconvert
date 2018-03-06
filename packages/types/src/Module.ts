import ExportStatement from './ExportStatement';
import Declaration from './Declaration';

export interface Module {
  declarationsByName: { [name: string]: Declaration[] };
  exportStatements: ExportStatement[];
}
