import * as bt from '@babel/types';
import * as ast from '@typeconvert/ast';
import normalizeComments from './normalizeComments';
import ParseContext from '../ParseContext';
import normalizeIdentifier from './normalizeIdentifier';
import normalizeType from './normalizeType';
import normalizeTypeParameterDeclaration from './normalizeTypeParameterDeclaration';
import normalizeFunctionParam from './normalizeFunctionParam';
import normalizeStatement from './normalizeStatement';

export default function normalizeFunctionDeclaration(
  input: bt.FunctionDeclaration,
  ctx: ParseContext,
): ast.FunctionDeclaration {
  if (!input.id) {
    return ctx.throw(input, 'Expected FunctionDeclaration to have an ID');
  }
  let restParam: ast.FunctionParameter | undefined = undefined;
  const params = [...input.params];
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

  return ast.createFunctionDeclaration({
    // TODO: declarations should always have an ID?
    id: normalizeIdentifier(input.id, ctx),
    // TODO: define params
    params: params.map(p => {
      if (bt.isRestElement(p)) {
        return ctx.throw(p, 'Unexpected parameter type ' + p.type);
      }
      return normalizeFunctionParam(p, ctx);
    }),
    restParam,
    typeParams: bt.isNoop(input.typeParameters)
      ? []
      : normalizeTypeParameterDeclaration(input.typeParameters, ctx),
    returnType: normalizeType(input.returnType, ctx),
    body: input.body.body
      .map(s => normalizeStatement(s, ctx))
      .reduce((a, b) => [...a, ...b], []),
    loc: input.loc,
    leadingComments: normalizeComments(input.leadingComments),
  });
}
