import {File} from '@babel/types';
import {parse} from '@babel/parser';
import Mode from './Mode';

export interface Options {
  allowImportExportEverywhere?: boolean;
  allowReturnOutsideFunction?: boolean;
  allowSuperOutsideMethod?: boolean;
  filename?: string;
  sourceType?: 'module' | 'script' | 'unambiguous';
  mode: Mode;
}
export default function parseSource(src: string, options: Options): File {
  return parse(src, {
    allowImportExportEverywhere: options.allowImportExportEverywhere,
    allowReturnOutsideFunction: options.allowReturnOutsideFunction,
    allowSuperOutsideMethod: options.allowSuperOutsideMethod,
    sourceType: options.sourceType || 'module',
    sourceFilename: options.filename,
    plugins: [
      'jsx',
      options.mode === Mode.Flow ? 'flow' : 'typescript',
      'doExpressions',
      'objectRestSpread',
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'exportDefaultFrom',
      'exportNamespaceFrom',
      'asyncGenerators',
      'functionBind',
      'dynamicImport',
      'numericSeparator',
      'optionalChaining',
      'bigInt',
      'optionalCatchBinding',
      'throwExpressions',
      'nullishCoalescingOperator',
    ],
  });
}
