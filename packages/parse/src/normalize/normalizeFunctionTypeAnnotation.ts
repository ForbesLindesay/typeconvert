import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeType from './normalizeType';
import normalizeTypeParameterDeclaration from './normalizeTypeParameterDeclaration';
import normalizeFunctionTypeParam from './normalizeFunctionTypeParam';
import normalizeFunctionParam from './normalizeFunctionParam';

export default function normalizeFunctionTypeAnnotation(
  input: bt.FunctionTypeAnnotation | bt.TSFunctionType,
  ctx: ParseContext,
): ast.FunctionTypeAnnotation {
  if (bt.isTSFunctionType(input)) {
    let restParam: ast.FunctionParameter | undefined = undefined;
    const params = [...input.parameters];
    if (params.length && bt.isRestElement(params[params.length - 1])) {
      const element = params.pop() as bt.RestElement;
      let argument = element.argument;

      if (
        bt.isMemberExpression(argument) ||
        bt.isRestElement(argument) ||
        bt.isAssignmentPattern(argument)
      ) {
        return ctx.throw(
          argument,
          'Unexpected rest element argument type ' + argument.type,
        );
      }

      if (!bt.isTSParameterProperty(argument)) {
        argument = {
          ...argument,
          typeAnnotation:
            argument.typeAnnotation && !bt.isNoop(argument.typeAnnotation)
              ? argument.typeAnnotation
              : element.typeAnnotation,
        };
      }

      restParam = normalizeFunctionParam(argument, ctx);
    }

    return ast.createFunctionTypeAnnotation({
      params: params.map(p => {
        if (bt.isRestElement(p)) {
          return ctx.throw(p, 'Unexpected rest element');
        }
        return normalizeFunctionParam(p, ctx);
      }),
      restParam,
      returnType: normalizeType(input.typeAnnotation, ctx),
      isConstructor: false,
      typeParams: normalizeTypeParameterDeclaration(input.typeParameters, ctx),
      loc: input.loc,
      leadingComments: normalizeComments(input.leadingComments),
    });
    // parameters: Array<Identifier | RestElement>;
    // typeAnnotation: TSTypeAnnotation | null;
  }
  return ast.createFunctionTypeAnnotation({
    params: input.params.map(p => normalizeFunctionTypeParam(p, ctx)),
    restParam: input.rest
      ? normalizeFunctionTypeParam(input.rest, ctx)
      : undefined,
    returnType: normalizeType(input.returnType, ctx),
    isConstructor: false,
    typeParams: normalizeTypeParameterDeclaration(input.typeParameters, ctx),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
