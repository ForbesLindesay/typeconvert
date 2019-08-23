import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeVariance from './normalizeVariance';
import normalizeFunctionTypeAnnotation from './normalizeFunctionTypeAnnotation';
import normalizeType from './normalizeType';

export default function normalizeObjectTypeAnnotation(
  input: bt.ObjectTypeAnnotation,
  ctx: ParseContext,
): ast.ObjectTypeAnnotation {
  return ast.createObjectTypeAnnotation({
    properties: input.properties.map(p => normalizeObjectTypeProperty(p, ctx)),
    callProperties: (input.callProperties || []).map(p =>
      normalizeObjectTypeCallProperty(p, ctx),
    ),
    exactness: input.exact
      ? ast.ObjectExactness.exact
      : input.inexact
      ? ast.ObjectExactness.inexact
      : // TODO: this default should be configureable as it is in flow
        ast.ObjectExactness.flexible,
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
function normalizeObjectTypeCallProperty(
  input: bt.ObjectTypeCallProperty,
  ctx: ParseContext,
): ast.FunctionTypeAnnotation {
  if (input.static) {
    return ctx.throw(input, 'Did not expect static call property');
  }
  if (!bt.isFunctionTypeAnnotation(input.value)) {
    return ctx.throw(input.value, 'Expected Function Type');
  }
  const ft = normalizeFunctionTypeAnnotation(input.value, ctx);
  return {
    ...ft,
    loc: input.loc,
    leadingComments: [
      ...normalizeComments(input.leadingComments),
      ...ft.leadingComments,
    ],
  };
}
function normalizeObjectTypeProperty(
  input: bt.ObjectTypeProperty | bt.ObjectTypeSpreadProperty,
  ctx: ParseContext,
): ast.ObjectTypeProperty | ast.ObjectTypeSpreadProperty {
  switch (input.type) {
    case 'ObjectTypeProperty':
      return ast.createObjectTypeProperty({
        key: bt.isIdentifier(input.key)
          ? normalizeIdentifier(input.key, ctx)
          : ast.createLiteralTypeAnnotation({
              value: input.key.value,
              loc: input.key.loc,
              leadingComments: normalizeComments(input.key.leadingComments),
            }),
        valueType: normalizeType(input.value, ctx),
        computed: false,
        optional: input.optional || false,
        mode: (input.kind === 'init' ? 'normal' : input.kind) || 'normal',
        proto: input.proto || false,
        static: input.static || false,
        variance: normalizeVariance(input.variance, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    case 'ObjectTypeSpreadProperty':
      return ast.createObjectTypeSpreadProperty({
        argument: normalizeType(input.argument, ctx),
        loc: input.loc,
        leadingComments: normalizeComments(input.leadingComments),
      });
    default:
      return ctx.assertNever(input);
  }
}
