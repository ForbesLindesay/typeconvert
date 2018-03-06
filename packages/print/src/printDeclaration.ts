import {Declaration, DeclarationKind, Mode} from '@typeconvert/types';
import Context from './Context';
import printType from './printType';

function _printDeclaration(declaration: Declaration, ctx: Context): void {
  switch (declaration.kind) {
    case DeclarationKind.FunctionDeclaration: {
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
        `declare function ${declaration.localName}(${params.join(
          ', ',
        )}): ${printType(declaration.returnType, ctx)};`,
      );
      break;
    }
    case DeclarationKind.ImportDefault:
      ctx.pushImport(
        `import ${declaration.localName} from '${declaration.relativePath}';`,
      );
      break;
    case DeclarationKind.TypeAlias:
      ctx.pushDeclaration(
        `type ${declaration.localName} = ${printType(declaration.right, ctx)};`,
      );
      break;
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
