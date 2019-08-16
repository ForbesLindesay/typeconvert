"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
const bt = require("@babel/types");
const types_1 = require("@typeconvert/types");
const getTypeOfBabelType_1 = require("./getTypeOfBabelType");
const getTypeOfExpression_1 = require("./getTypeOfExpression");
const getTypeParameters_1 = require("./getTypeParameters");
const extractFunction_1 = require("./extractFunction");
function getCommentType(comment, ctx) {
    switch (comment.type) {
        case 'BlockComment':
        case 'CommentBlock':
            return 'BlockComment';
        case 'LineComment':
        case 'CommentLine':
            return 'LineComment';
        default:
            throw ctx.getError('Unknown comment type: ' + comment.type, comment);
    }
}
function getParam(param, ctx) {
    if (bt.isAssignmentExpression(param)) {
        return getParam(param.left, ctx);
    }
    if (bt.isAssignmentPattern(param)) {
        return getParam(param.left, ctx);
    }
    const typeAnnotation = param.typeAnnotation;
    if (!typeAnnotation || !(bt.isTypeAnnotation(typeAnnotation) || bt.isTSTypeAnnotation(typeAnnotation))) {
        throw ctx.getError('Expected type annotation', param);
    }
    return {
        name: bt.isIdentifier(param) ? param.name : undefined,
        type: getTypeOfBabelType_1.default(typeAnnotation.typeAnnotation, ctx),
        // TODO: param.optional?
        optional: false
    };
}
exports.getParam = getParam;
function _getNormalizedDeclaration(declaration, ctx) {
    const loc = declaration.loc ? new types_1.SourceLocation(declaration.loc) : null;
    const leadingComments = (declaration.leadingComments || []).map(c => ({
        type: getCommentType(c, ctx),
        value: c.value
    })).filter(c => c.value.replace(/\@flow/g, '').trim());
    switch (declaration.type) {
        case 'DeclareFunction':
            {
                const id = declaration.id;
                const typeAnnotation = id.typeAnnotation;
                if (!typeAnnotation || bt.isNoop(typeAnnotation)) {
                    throw ctx.getError('Declare function should always have a FunctionTypeAnnotation', id);
                }
                const t = typeAnnotation.typeAnnotation;
                if (!bt.isFunctionTypeAnnotation(t)) {
                    throw ctx.getError('Declare function should always have a FunctionTypeAnnotation', t);
                }
                const params = t.params.map(param => {
                    return {
                        name: param.name ? param.name.name : undefined,
                        type: getTypeOfBabelType_1.default(param.typeAnnotation, ctx),
                        optional: param.optional || false
                    };
                });
                const restParam = t.rest ? {
                    name: t.rest.name ? t.rest.name.name : undefined,
                    type: getTypeOfBabelType_1.default(t.rest.typeAnnotation, ctx),
                    optional: false
                } : undefined;
                const returnType = getTypeOfBabelType_1.default(t.returnType, ctx);
                const typeParameters = getTypeParameters_1.default(t.typeParameters, ctx);
                return {
                    kind: types_1.DeclarationKind.FunctionDeclaration,
                    leadingComments,
                    localName: id.name,
                    loc,
                    params,
                    restParam,
                    returnType,
                    typeParameters
                };
            }
        case 'ImportDefault':
            {
                const filename = ctx.tryResolve(declaration.relativePath);
                if (!filename) {
                    throw ctx.getError(`Unable to resolve "${declaration.relativePath}"`, declaration);
                }
                return {
                    kind: types_1.DeclarationKind.ImportDefault,
                    localName: declaration.localName,
                    loc: declaration.loc && new types_1.SourceLocation(declaration.loc),
                    leadingComments: (declaration.leadingComments || []).slice(),
                    relativePath: declaration.relativePath,
                    filename
                };
            }
        case 'TypeAlias':
            return {
                kind: types_1.DeclarationKind.TypeAlias,
                localName: declaration.id.name,
                loc: declaration.loc && new types_1.SourceLocation(declaration.loc),
                leadingComments: (declaration.leadingComments || []).slice(),
                typeParameters: getTypeParameters_1.default(declaration.typeParameters, ctx),
                right: getTypeOfBabelType_1.default(declaration.right, ctx)
            };
        case 'TSDeclareFunction':
        case 'FunctionDeclaration':
            {
                const id = declaration.id;
                if (!id) {
                    throw ctx.getError('You must provide an id for your function declaration', declaration);
                }
                const { typeParameters, params, restParam, returnType } = extractFunction_1.default(declaration, ctx);
                return {
                    kind: types_1.DeclarationKind.FunctionDeclaration,
                    leadingComments,
                    localName: id.name,
                    loc,
                    params,
                    restParam,
                    returnType,
                    typeParameters
                };
            }
        case 'VariableDeclaration':
            {
                if (declaration.typeAnnotation) {}
                const type = declaration.typeAnnotation ? getTypeOfBabelType_1.default(declaration.typeAnnotation.typeAnnotation, ctx) : declaration.init ? getTypeOfExpression_1.default(declaration.init, ctx) : null;
                if (!type) {
                    throw ctx.getError('Unable to infer type of variable declaration', declaration);
                }
                return {
                    kind: types_1.DeclarationKind.VariableDeclaration,
                    mode: declaration.mode,
                    typeAnnotation: type,
                    leadingComments: (declaration.leadingComments || []).slice(),
                    localName: declaration.localName,
                    loc: declaration.loc && new types_1.SourceLocation(declaration.loc)
                };
            }
        default:
            return declaration;
    }
}
function getNormalizedDeclaration(declaration, ctx) {
    const result = _getNormalizedDeclaration(declaration, ctx);
    if (result === declaration) {
        throw ctx.getError('Unsupported type ' + declaration.type, declaration);
    }
    return result;
}
exports.default = getNormalizedDeclaration;
//# sourceMappingURL=getNormalizedDeclaration.js.map