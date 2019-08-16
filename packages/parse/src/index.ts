import * as ast from '@typeconvert/ast';
import Mode from './Mode';
import parseSource, {Options} from './babylon';
import normalizeStatement from './normalize/normalizeStatement';
import normalizeComments from './normalize/normalizeComments';
import ParseContext from './ParseContext';

export {Options, Mode};
export default function parse(src: string, options: Options): ast.File {
  const babylonAST = parseSource(src, options);
  const ctx = new ParseContext(src);
  return ast.createFile({
    statements: babylonAST.program.body
      .map(statement => normalizeStatement(statement, ctx))
      .reduce((a, b) => [...a, ...b], []),
    loc: babylonAST.loc,
    leadingComments: normalizeComments(
      babylonAST.leadingComments,
      babylonAST.program.leadingComments,
    ),
  });
}
