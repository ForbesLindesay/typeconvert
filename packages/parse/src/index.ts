import {Mode, Module} from '@typeconvert/types';
import ProgramContext, {Modules, Options} from './ProgramContext';

export {Mode, Module, Modules, Options, ProgramContext};
export default function parse(filenames: string[], options: Options): Modules {
  const ctx = new ProgramContext(options);
  filenames.forEach(filename => ctx.parse(filename));
  return ctx.parsedFiles;
}
