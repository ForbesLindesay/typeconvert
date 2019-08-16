import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';
import normalizeTSType from './normalizeTSType';

export default function normalizeTSTypeParameterDeclaration(
  input: bt.TSTypeParameterDeclaration | null,
  ctx: ParseContext,
): ast.TypeParameter[] {
  if (!input) return [];
  if (!input.params.length) return [];
  return input.params.map(p => {
    if (!p.name) {
      return ctx.throw(p, 'Type parameters should have a name');
    }
    return ast.createTypeParameter({
      id: ast.createIdentifier({
        name: p.name,
        loc: p.loc, // TODO: use actual range for name portion here
        leadingComments: normalizeComments(p.leadingComments),
      }),
      constraint: p.constraint ? normalizeTSType(p.constraint, ctx) : undefined,
      default: p.default ? normalizeTSType(p.default, ctx) : undefined,
      variance: ast.Variance.ReadWrite,
      loc: p.loc,
      leadingComments: normalizeComments(p.leadingComments),
    });
  });
}
