import * as bt from '@babel/types';
import {
  Comment,
  Declaration,
  DeclarationKind,
  FunctionParam,
  SourceLocation,
} from '@typeconvert/types';
import RawDeclaration from '../walk/RawDeclaration';
import {InferScopeContext} from './InferContext';
import getTypeOfExpression from '../getTypeOfExpression';
import getTypeParameters from './getTypeParameters';
import extractFunction from '../extractFunction';
import {DeeperWaitable} from '../utils/Waitable';

function getCommentType(comment: bt.Comment, ctx: InferScopeContext) {
  switch (comment.type as string) {
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

export function getParam(
  param: bt.LVal,
  ctx: InferScopeContext,
): DeeperWaitable<FunctionParam> {
  if (bt.isAssignmentExpression(param)) {
    return getParam(param.left, ctx);
  }
  if (bt.isAssignmentPattern(param)) {
    return getParam(param.left, ctx);
  }
  const typeAnnotation = (param as any).typeAnnotation;
  if (
    !typeAnnotation ||
    !(
      bt.isTypeAnnotation(typeAnnotation) ||
      bt.isTSTypeAnnotation(typeAnnotation)
    )
  ) {
    throw ctx.getError('Expected type annotation', param);
  }
  return {
    name: bt.isIdentifier(param) ? param.name : undefined,
    type: ctx.getTypeOfBabelType(typeAnnotation.typeAnnotation),
    // TODO: param.optional?
    optional: false,
  };
}
export default function getNormalizedDeclarationUncached(
  declaration: RawDeclaration,
  ctx: InferScopeContext,
): DeeperWaitable<Declaration> {
  const loc = declaration.loc ? new SourceLocation(declaration.loc) : null;
  const leadingComments = (declaration.leadingComments || [])
    .map((c): Comment => ({
      type: getCommentType(c, ctx),
      value: c.value,
    }))
    .filter(c => c.value.replace(/\@flow/g, '').trim());
  switch (declaration.type) {
    case 'DeclareFunction': {
      const id = declaration.id;
      const typeAnnotation = id.typeAnnotation;
      if (!typeAnnotation || bt.isNoop(typeAnnotation)) {
        throw ctx.getError(
          'Declare function should always have a FunctionTypeAnnotation',
          id,
        );
      }
      const t = typeAnnotation.typeAnnotation;
      if (!bt.isFunctionTypeAnnotation(t)) {
        throw ctx.getError(
          'Declare function should always have a FunctionTypeAnnotation',
          t,
        );
      }
      const params = t.params.map((param): DeeperWaitable<FunctionParam> => {
        return {
          name: param.name ? param.name.name : undefined,
          type: ctx.getTypeOfBabelType(param.typeAnnotation),
          optional: param.optional || false,
        };
      });
      const restParam = t.rest
        ? {
            name: t.rest.name ? t.rest.name.name : undefined,
            type: ctx.getTypeOfBabelType(t.rest.typeAnnotation),
            optional: false,
          }
        : undefined;
      const returnType = ctx.getTypeOfBabelType(t.returnType);
      const typeParameters = getTypeParameters(t.typeParameters, ctx);

      return {
        kind: DeclarationKind.FunctionDeclaration,
        leadingComments,
        localName: id.name,
        loc,
        params,
        restParam,
        returnType,
        typeParameters,
      };
    }
    case 'ImportDefault': {
      const filename = ctx.tryResolve(declaration.relativePath);
      if (!filename) {
        throw ctx.getError(
          `Unable to resolve "${declaration.relativePath}"`,
          declaration,
        );
      }
      return {
        kind: DeclarationKind.ImportDefault,
        localName: declaration.localName,
        loc: declaration.loc && new SourceLocation(declaration.loc),
        leadingComments: (declaration.leadingComments || []).slice(),
        relativePath: declaration.relativePath,
        filename,
      };
    }
    case 'TypeAlias':
      return {
        kind: DeclarationKind.TypeAlias,
        localName: declaration.id.name,
        loc: declaration.loc && new SourceLocation(declaration.loc),
        leadingComments: (declaration.leadingComments || []).slice(),
        typeParameters: getTypeParameters(declaration.typeParameters, ctx),
        right: ctx.getTypeOfBabelType(declaration.right),
      };
    case 'TSDeclareFunction':
    case 'FunctionDeclaration': {
      const id = declaration.id;
      if (!id) {
        throw ctx.getError(
          'You must provide an id for your function declaration',
          declaration,
        );
      }
      const {typeParameters, params, restParam, returnType} = extractFunction(
        declaration,
        ctx,
      );
      return {
        kind: DeclarationKind.FunctionDeclaration,
        leadingComments,
        localName: id.name,
        loc,
        params,
        restParam,
        returnType,
        typeParameters,
      };
    }
    case 'VariableDeclaration': {
      if (declaration.typeAnnotation) {
      }
      const type = declaration.typeAnnotation
        ? ctx.getTypeOfBabelType(declaration.typeAnnotation.typeAnnotation)
        : declaration.init ? getTypeOfExpression(declaration.init, ctx) : null;
      if (!type) {
        throw ctx.getError(
          'Unable to infer type of variable declaration',
          declaration,
        );
      }
      return {
        kind: DeclarationKind.VariableDeclaration,
        mode: declaration.mode,
        typeAnnotation: type,
        leadingComments: (declaration.leadingComments || []).slice(),
        localName: declaration.localName,
        loc: declaration.loc && new SourceLocation(declaration.loc),
      };
    }
    default:
      return ctx.assertNever('Unsupported declaration kind', declaration);
  }
}
