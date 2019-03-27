import {Mode, Module} from '@typeconvert/types';
import {InferProgramContext} from './infer/InferContext';
// import ProgramContext, {Modules, Options} from './ProgramContext';

export {Mode, Module};
export default function parse(filenames: string[], options: {mode: Mode}): any {
  const ctx = new InferProgramContext(options.mode);
  filenames.forEach(filename => ctx.getExports(filename));
  // return ctx.parsedFiles;
  return ctx;
}
