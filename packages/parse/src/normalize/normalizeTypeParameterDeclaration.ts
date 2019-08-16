import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeFlowType from './normalizeFlowType';
import normalizeComments from './normalizeComments';
import normalizeVariance from './normalizeVariance';

export default function normalizeTypeParameterDeclaration(
  input: bt.TypeParameterDeclaration | null,
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
      constraint: p.bound
        ? normalizeFlowType(p.bound.typeAnnotation, ctx)
        : undefined,
      default: p.default ? normalizeFlowType(p.default, ctx) : undefined,
      variance: normalizeVariance(p.variance, ctx),
      loc: p.loc,
      leadingComments: normalizeComments(p.leadingComments),
    });
  });
}
