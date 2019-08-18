import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';
import normalizeComments from './normalizeComments';
import normalizeVariance from './normalizeVariance';

export default function normalizeTypeParameterDeclaration(
  input: bt.TypeParameterDeclaration | bt.TSTypeParameterDeclaration | null,
  ctx: ParseContext,
): ast.TypeParameter[] {
  if (!input) return [];
  if (!input.params.length) return [];

  if (bt.isTSTypeParameterDeclaration(input)) {
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
        constraint: normalizeType(p.constraint, ctx),
        default: normalizeType(p.default, ctx),
        variance: ast.Variance.ReadWrite,
        loc: p.loc,
        leadingComments: normalizeComments(p.leadingComments),
      });
    });
  }

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
      constraint: normalizeType(p.bound, ctx),
      default: normalizeType(p.default, ctx),
      variance: normalizeVariance(p.variance, ctx),
      loc: p.loc,
      leadingComments: normalizeComments(p.leadingComments),
    });
  });
}
