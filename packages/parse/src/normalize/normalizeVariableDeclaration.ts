import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';
import normalizePattern from './normalizePattern';
import normalizeExpression from './normalizeExpression';

export default function normalizeVariableDeclaration(
  input: bt.VariableDeclaration,
  ctx: ParseContext,
): ast.VariableDeclaration[] {
  return input.declarations.map((decl, i) => {
    const id = decl.id;
    if (!bt.isIdentifier(id) && !bt.isPattern(id)) {
      return ctx.throw(
        decl.id,
        `Expected an identifier pattern but got ${id.type}`,
      );
    }
    return ast.createVariableDeclaration({
      id: normalizePattern(id, ctx),
      init: decl.init ? normalizeExpression(decl.init, ctx) : undefined,
      mode: input.kind,
      declare: input.declare || false,
      definite: decl.definite || false,
      type: normalizeType(id.typeAnnotation, ctx),
      leadingComments:
        i === 0
          ? normalizeComments(input.leadingComments, decl.leadingComments)
          : normalizeComments(decl.leadingComments),
      loc: input.declarations.length === 1 ? input.loc : decl.loc,
    });
  });
}
