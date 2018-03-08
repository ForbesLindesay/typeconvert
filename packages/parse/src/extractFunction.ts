import * as bt from '@babel/types';
import {
  TypeParameter,
  FunctionParam,
  Type,
  TypeKind,
  SourceLocation,
} from '@typeconvert/types';
import Context from './Context';
import getTypeOfBabelType from './getTypeOfBabelType';
import {getParam} from './getNormalizedDeclaration';
import getTypeParameters from './getTypeParameters';
import getTypeOfExpression from './getTypeOfExpression';
import walkStatement from './walkStatement';
import mergeTypes from './mergeTypes';

export interface ExtractedFunction {
  typeParameters: TypeParameter[];
  params: FunctionParam[];
  restParam: FunctionParam | undefined;
  returnType: Type;
}
export default function extractFunction(
  expression: bt.Function | bt.TSDeclareFunction,
  ctx: Context,
): ExtractedFunction {
  let restParam: FunctionParam | undefined = undefined;
  const params = expression.params
    .map((param): FunctionParam => {
      if (bt.isRestElement(param)) {
        if (!param.typeAnnotation || bt.isNoop(param.typeAnnotation)) {
          throw ctx.getError('Expected type annotation', param);
        }
        restParam = {
          optional: false,
          name: bt.isIdentifier(param.argument)
            ? param.argument.name
            : undefined,
          type: getTypeOfBabelType(param.typeAnnotation.typeAnnotation, ctx),
        };
        return null as any;
      }
      return getParam(param, ctx);
    })
    .filter(v => v != null);
  return {
    typeParameters: getTypeParameters(expression.typeParameters, ctx),
    params,
    restParam,
    returnType: getReturnType(
      expression,
      params.concat(restParam ? [restParam] : []),
      ctx,
    ),
  };
}
function getReturnType(
  expression: bt.Function | bt.TSDeclareFunction,
  params: FunctionParam[],
  ctx: Context,
): Type {
  if (expression.returnType && !bt.isNoop(expression.returnType)) {
    return getTypeOfBabelType(expression.returnType.typeAnnotation, ctx);
  }
  if (bt.isTSDeclareFunction(expression)) {
    throw ctx.getError('missing return type', expression);
  }
  if (bt.isExpression(expression.body)) {
    return getTypeOfExpression(expression.body as bt.Expression, ctx);
  }
  const body = expression.body as bt.BlockStatement;
  const bodyContext = ctx.getFunctionContext(params);
  body.body.forEach(statement => walkStatement(statement, bodyContext));
  if (bodyContext.returnValues.length === 0) {
    return {
      kind: TypeKind.Void,
      loc: expression.loc && new SourceLocation(expression.loc),
    };
  }
  if (bodyContext.returnValues.length === 1) {
    return getTypeOfExpression(
      bodyContext.returnValues[0].expression,
      bodyContext.returnValues[0].context,
    );
  }
  return mergeTypes(
    expression.loc && new SourceLocation(expression.loc),
    ...bodyContext.returnValues.map(v =>
      getTypeOfExpression(v.expression, v.context),
    ),
  );
}
