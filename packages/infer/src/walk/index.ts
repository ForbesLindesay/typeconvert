import {File} from '@babel/types';
import {Mode} from '@typeconvert/types';
import {RootWalkContext} from './WalkContext';
import WalkResult from './WalkResult';
import walkStatement from './walkStatement';

export default function walk(
  ast: File,
  filename: string,
  src: string,
  mode: Mode,
): WalkResult {
  const ctx = new RootWalkContext(filename, src, mode);
  const scope = ctx.getContext();
  ast.program.body.forEach(statement => walkStatement(statement, scope));
  return ctx.getResult();
}
