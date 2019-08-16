import { Mode } from '@typeconvert/types';
import { File } from '@babel/types';
export interface Options {
    allowImportExportEverywhere?: boolean;
    allowReturnOutsideFunction?: boolean;
    allowSuperOutsideMethod?: boolean;
    filename?: string;
    sourceType?: 'module' | 'script' | 'unambiguous';
    mode: Mode;
}
export default function parseSource(src: string, options: Options): File;
