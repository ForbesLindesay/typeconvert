"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const bt = require("@babel/types");
const types_1 = require("@typeconvert/types");
const getTypeOfBabelType_1 = require("./getTypeOfBabelType");
const getNormalizedDeclaration_1 = require("./getNormalizedDeclaration");
const getTypeParameters_1 = require("./getTypeParameters");
const getTypeOfExpression_1 = require("./getTypeOfExpression");
const walkStatement_1 = require("./walkStatement");
const mergeTypes_1 = require("./mergeTypes");
function extractFunction(expression, ctx) {
    let restParam = undefined;
    const params = expression.params.map(param => {
        if (bt.isRestElement(param)) {
            if (!param.typeAnnotation || bt.isNoop(param.typeAnnotation)) {
                throw ctx.getError('Expected type annotation', param);
            }
            restParam = {
                optional: false,
                name: bt.isIdentifier(param.argument) ? param.argument.name : undefined,
                type: getTypeOfBabelType_1.default(param.typeAnnotation.typeAnnotation, ctx)
            };
            return null;
        }
        return getNormalizedDeclaration_1.getParam(param, ctx);
    }).filter(v => v != null);
    return {
        typeParameters: getTypeParameters_1.default(expression.typeParameters, ctx),
        params,
        restParam,
        returnType: getReturnType(expression, params.concat(restParam ? [restParam] : []), ctx)
    };
}
exports.default = extractFunction;
function getReturnType(expression, params, ctx) {
    if (expression.returnType && !bt.isNoop(expression.returnType)) {
        return getTypeOfBabelType_1.default(expression.returnType.typeAnnotation, ctx);
    }
    if (bt.isTSDeclareFunction(expression)) {
        throw ctx.getError('missing return type', expression);
    }
    if (bt.isExpression(expression.body)) {
        return getTypeOfExpression_1.default(expression.body, ctx);
    }
    const body = expression.body;
    const bodyContext = ctx.getFunctionContext(params);
    body.body.forEach(statement => walkStatement_1.default(statement, bodyContext));
    if (bodyContext.returnValues.length === 0) {
        return {
            kind: types_1.TypeKind.Void,
            loc: expression.loc && new types_1.SourceLocation(expression.loc)
        };
    }
    if (bodyContext.returnValues.length === 1) {
        return getTypeOfExpression_1.default(bodyContext.returnValues[0].expression, bodyContext.returnValues[0].context);
    }
    return mergeTypes_1.default(expression.loc && new types_1.SourceLocation(expression.loc), ...bodyContext.returnValues.map(v => getTypeOfExpression_1.default(v.expression, v.context)));
}
//# sourceMappingURL=extractFunction.js.map