import {Mode, Module} from '@typeconvert/types';
import Context from './Context';
import printExportStatement from './printExportStatement';

export default function printModule(m: Module, mode: Mode) {
  const ctx = new Context(m, mode);
  ctx.exportStatements.forEach(exp => {
    printExportStatement(exp, ctx);
  });
  return ctx.toString();
}
