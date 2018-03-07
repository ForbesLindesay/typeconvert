import {Mode, Module} from '@typeconvert/types';
import Context, {Modules, Options} from './Context';
import printExportStatement from './printExportStatement';

export {Mode, Modules, Module, Options};

export default function printModule(
  filename: string,
  modules: Modules,
  options: Options,
) {
  const ctx = new Context(filename, modules, options);
  ctx.exportStatements.forEach(exp => {
    printExportStatement(exp, ctx);
  });
  return ctx.toString();
}
