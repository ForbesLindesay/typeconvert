import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import ParseContext from '../ParseContext';
import normalizeComments from './normalizeComments';
import normalizeGenericTypeAnnotation from './normalizeGenericTypeAnnotation';
import normalizeFunctionTypeAnnotation from './normalizeFunctionTypeAnnotation';

function normalizeTypeCore(
  input: bt.FlowType | bt.TSType,
  ctx: ParseContext,
): ast.TypeAnnotation {
  switch (input.type) {
    case 'AnyTypeAnnotation':
    case 'TSAnyKeyword':
      return ast.createAnyTypeAnnotation({
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'GenericTypeAnnotation':
      return normalizeGenericTypeAnnotation(input, ctx);
    case 'NumberTypeAnnotation':
    case 'TSNumberKeyword':
      return ast.createStringTypeAnnotation({
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'StringTypeAnnotation':
    case 'TSStringKeyword':
      return ast.createStringTypeAnnotation({
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'TupleTypeAnnotation':
      return ast.createTupleTypeAnnotation({
        elements: input.types.map(t => normalizeType(t, ctx)),
        restElement: undefined,
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'TSTupleType': {
      const [...elementTypes] = input.elementTypes;
      let restElement = undefined;
      if (bt.isTSRestType(elementTypes[elementTypes.length - 1])) {
        restElement = normalizeType(
          (elementTypes.pop() as bt.TSRestType).typeAnnotation,
          ctx,
        );
      }
      return ast.createTupleTypeAnnotation({
        elements: input.elementTypes.map(t => normalizeType(t, ctx)),
        restElement,
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    }
    case 'IntersectionTypeAnnotation':
      return ast.createIntersectionTypeAnnotation({
        types: input.types.map(t => normalizeType(t, ctx)),
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'TSIntersectionType':
      return ast.createIntersectionTypeAnnotation({
        types: input.types.map(t => normalizeType(t, ctx)),
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'UnionTypeAnnotation':
      return ast.createUnionTypeAnnotation({
        types: input.types.map(t => normalizeType(t, ctx)),
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'TSUnionType':
      return ast.createUnionTypeAnnotation({
        types: input.types.map(t => normalizeType(t, ctx)),
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'VoidTypeAnnotation':
    case 'TSVoidKeyword':
      return ast.createVoidTypeAnnotation({
        leadingComments: normalizeComments(input.leadingComments),
        loc: input.loc,
      });
    case 'FunctionTypeAnnotation':
      return normalizeFunctionTypeAnnotation(input, ctx);
    case 'TSFunctionType':
      return normalizeFunctionTypeAnnotation(input, ctx);
    default:
      return ctx.assertNever(input as never);
  }
}
export default function normalizeType(
  input: bt.FlowType | bt.TSType | bt.TypeAnnotation | bt.TSTypeAnnotation,
  ctx: ParseContext,
): ast.TypeAnnotation;
export default function normalizeType(
  input:
    | bt.FlowType
    | bt.TSType
    | bt.TypeAnnotation
    | bt.TSTypeAnnotation
    | bt.Noop
    | null,
  ctx: ParseContext,
): ast.TypeAnnotation | undefined;
export default function normalizeType(
  input:
    | bt.FlowType
    | bt.TSType
    | bt.TypeAnnotation
    | bt.TSTypeAnnotation
    | bt.Noop
    | null,
  ctx: ParseContext,
): ast.TypeAnnotation | undefined {
  if (!input || bt.isNoop(input)) {
    return undefined;
  }
  if (bt.isTypeAnnotation(input) || bt.isTSTypeAnnotation(input)) {
    return normalizeTypeCore(input.typeAnnotation, ctx);
  } else {
    return normalizeTypeCore(input, ctx);
  }
}
