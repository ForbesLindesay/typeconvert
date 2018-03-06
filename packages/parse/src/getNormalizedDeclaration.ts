import * as bt from '@babel/types';
import {
  Comment,
  Declaration,
  DeclarationKind,
  FunctionParam,
  SourceLocation,
  TypeParameter,
  Variance,
} from '@typeconvert/types';
import RawDeclaration from './RawDeclaration';
import Context from './Context';
import getTypeOfBabelType from './getTypeOfBabelType';
import getTypeOfExpression from './getTypeOfExpression';

function getCommentType(comment: bt.Comment, ctx: Context) {
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

function getTypeParameters(
  typeParameters: bt.TypeParameterDeclaration | null,
  ctx: Context,
) {
  return typeParameters
    ? typeParameters.params.map((p): TypeParameter => {
        if (!p.name) {
          throw ctx.getError('Cannot have a type parameter without a name', p);
        }
        return {
          name: p.name,
          variance:
            p.variance && p.variance.kind === 'plus'
              ? Variance.covariant
              : p.variance && p.variance.kind === 'minus'
                ? Variance.contravariant
                : Variance.invariant,
        };
      })
    : [];
}
function _getNormalizedDeclaration(
  declaration: RawDeclaration,
  ctx: Context,
): Declaration {
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
      const params = t.params.map((param): FunctionParam => {
        return {
          name: param.name ? param.name.name : undefined,
          type: getTypeOfBabelType(param.typeAnnotation, ctx),
        };
      });
      const restParam = t.rest
        ? {
            name: t.rest.name ? t.rest.name.name : undefined,
            type: getTypeOfBabelType(t.rest.typeAnnotation, ctx),
          }
        : undefined;
      const returnType = getTypeOfBabelType(t.returnType, ctx);
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
    case 'ImportDefault':
      return {
        kind: DeclarationKind.ImportDefault,
        localName: declaration.localName,
        loc: declaration.loc && new SourceLocation(declaration.loc),
        leadingComments: (declaration.leadingComments || []).slice(),
        relativePath: declaration.relativePath,
      };
    case 'TypeAlias':
      return {
        kind: DeclarationKind.TypeAlias,
        localName: declaration.id.name,
        loc: declaration.loc && new SourceLocation(declaration.loc),
        leadingComments: (declaration.leadingComments || []).slice(),
        typeParameters: getTypeParameters(declaration.typeParameters, ctx),
        right: getTypeOfBabelType(declaration.right, ctx),
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
      function getParam(param: bt.LVal): FunctionParam {
        if (bt.isAssignmentExpression(param)) {
          return getParam(param.left);
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
          type: getTypeOfBabelType(typeAnnotation.typeAnnotation, ctx),
        };
      }
      let restParam = undefined;
      const params = declaration.params
        .map((param): FunctionParam => {
          if (bt.isRestElement(param)) {
            if (!param.typeAnnotation || bt.isNoop(param.typeAnnotation)) {
              throw ctx.getError('Expected type annotation', param);
            }
            restParam = {
              name: bt.isIdentifier(param.argument)
                ? param.argument.name
                : undefined,
              type: getTypeOfBabelType(
                param.typeAnnotation.typeAnnotation,
                ctx,
              ),
            };
            return null as any;
          }
          return getParam(param);
        })
        .filter(v => v != null);
      // TypeParameterDeclaration | TSTypeParameterDeclaration
      const typeParameters =
        declaration.typeParameters &&
        bt.isTypeParameterDeclaration(declaration.typeParameters)
          ? getTypeParameters(declaration.typeParameters, ctx)
          : declaration.typeParameters &&
            bt.isTSTypeParameterDeclaration(declaration.typeParameters)
            ? declaration.typeParameters.params.map(
                (p: bt.TSTypeParameter): TypeParameter => {
                  if (!p.name) {
                    throw ctx.getError(
                      'Cannot have a type parameter without a name',
                      p,
                    );
                  }
                  return {
                    name: p.name,
                    variance: Variance.invariant,
                  };
                },
              )
            : [];

      if (declaration.returnType && !bt.isNoop(declaration.returnType)) {
        const returnType = getTypeOfBabelType(
          declaration.returnType.typeAnnotation,
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
      throw ctx.getError('Return type required', declaration);
    }
    case 'VariableDeclaration': {
      if (declaration.typeAnnotation) {
      }
      const type = declaration.typeAnnotation
        ? getTypeOfBabelType(declaration.typeAnnotation.typeAnnotation, ctx)
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
      return declaration;
  }
}

export default function getNormalizedDeclaration(
  declaration: RawDeclaration,
  ctx: Context,
): Declaration {
  const result = _getNormalizedDeclaration(declaration, ctx);
  if ((result as any) === declaration) {
    throw new Error('Unsupported type ' + declaration.type);
  }
  return result;
}
