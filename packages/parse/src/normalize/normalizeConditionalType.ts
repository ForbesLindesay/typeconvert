import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';

export default function normalizeConditionalType(
  input: bt.TSConditionalType,
  ctx: ParseContext,
): ast.ConditionalType {
  return ast.createConditionalType({
    test: {
      left: normalizeType(input.checkType, ctx),
      right: normalizeType(input.extendsType, ctx),
      operation: 'extends',
    },
    consequent: normalizeType(input.trueType, ctx),
    alternate: normalizeType(input.falseType, ctx),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
