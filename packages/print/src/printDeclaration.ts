import {
  Declaration,
  DeclarationKind,
  Mode,
  TypeKind,
  Variance,
  TypeParameter,
} from '@typeconvert/types';
import Context from './Context';
import printType from './printType';

function printTypeParameters(
  typeParameters: TypeParameter[],
  ctx: Context,
): string {
  const params = typeParameters.map(
    p =>
      `${
        ctx.mode === Mode.typescript
          ? ''
          : p.variance === Variance.covariant
            ? '+'
            : p.variance === Variance.contravariant ? '-' : ''
      }${p.name}${
        p.extends
          ? `${ctx.mode === Mode.flow ? ': ' : ' extends '}${printType(
              p.extends,
              ctx,
            )}`
          : ''
      }${p.default ? `=${printType(p.default, ctx)}` : ''}`,
  );
  return params.length ? `<${params.join(', ')}>` : '';
}

function _printDeclaration(declaration: Declaration, ctx: Context): void {
  switch (declaration.kind) {
    case DeclarationKind.FunctionDeclaration: {
      const restParam = declaration.restParam;
      // flow can handle unions of array types as a rest param
      // typescript cannot, but we can simply treat as an overload
      if (
        ctx.mode === Mode.typescript &&
        restParam &&
        restParam.type.kind === TypeKind.Union
      ) {
        restParam.type.types.forEach(type => {
          printDeclaration(
            {
              ...declaration,
              restParam: {
                ...restParam,
                type,
              },
            },
            ctx,
          );
        });
        break;
      }
      // flow supports a "tuple" type as the rest param
      // we can simply explode this into the params to support typescript
      if (
        ctx.mode === Mode.typescript &&
        restParam &&
        restParam.type.kind === TypeKind.Tuple
      ) {
        printDeclaration(
          {
            ...declaration,
            params: declaration.params.concat(
              restParam.type.types.map(type => ({type})),
            ),
            restParam: undefined,
          },
          ctx,
        );
        break;
      }
      const params = declaration.params.map((param, i) => {
        return `${param.name || '_' + i}: ${printType(param.type, ctx)}`;
      });
      if (declaration.restParam) {
        params.push(
          `...${declaration.restParam.name || '_' + params.length}: ${printType(
            declaration.restParam.type,
            ctx,
          )}`,
        );
      }
      ctx.pushDeclaration(
        `declare function ${declaration.localName}${printTypeParameters(
          declaration.typeParameters,
          ctx,
        )}(${params.join(', ')}): ${printType(declaration.returnType, ctx)};`,
      );
      break;
    }
    case DeclarationKind.ImportDefault:
      ctx.pushImport(
        `import ${declaration.localName} from '${declaration.relativePath}';`,
      );
      break;
    case DeclarationKind.TypeAlias: {
      ctx.pushDeclaration(
        `type ${declaration.localName}${printTypeParameters(
          declaration.typeParameters,
          ctx,
        )} = ${printType(declaration.right, ctx)};`,
      );
      break;
    }
    case DeclarationKind.VariableDeclaration:
      ctx.pushDeclaration(
        `declare ${ctx.mode === Mode.flow ? 'var' : declaration.mode} ${
          declaration.localName
        }: ${printType(declaration.typeAnnotation, ctx)};`,
      );
      break;
    default:
      return declaration;
  }
}

export default function printDeclaration(
  declaration: Declaration,
  ctx: Context,
): void {
  const result = _printDeclaration(declaration, ctx);
  if (result) {
    throw new Error('Unsupported declaration kind ' + declaration.kind);
  }
}
