import {Mode, Type, TypeKind, Variance} from '@typeconvert/types';
import Context from './Context';
function bracketType(type: Type, ctx: Context): string {
  const raw = printType(type, ctx);
  switch (type.kind) {
    case TypeKind.Any:
    case TypeKind.Boolean:
    case TypeKind.BooleanLiteral:
    case TypeKind.GenericApplication:
    case TypeKind.Null:
    case TypeKind.Number:
    case TypeKind.NumericLiteral:
    case TypeKind.Object:
    case TypeKind.Reference:
    case TypeKind.String:
    case TypeKind.StringLiteral:
    case TypeKind.Void:
      return raw;
    case TypeKind.Function:
    case TypeKind.Generic:
    case TypeKind.Intersection:
    case TypeKind.Tuple:
    case TypeKind.TypeOf:
    case TypeKind.Union:
      return `(${raw})`;
    default:
      return type;
  }
}
function _printType(type: Type, ctx: Context): string {
  switch (type.kind) {
    case TypeKind.Any:
      return 'any';
    case TypeKind.Boolean:
      return 'boolean';
    case TypeKind.BooleanLiteral:
      return type.value ? 'true' : 'false';
    case TypeKind.Function: {
      const params = type.params.map((param, i) => {
        return `${param.name || '_' + i}: ${printType(param.type, ctx)}`;
      });
      if (type.restParam) {
        params.push(
          `...${type.restParam.name || '_' + params.length}: ${printType(
            type.restParam.type,
            ctx,
          )}`,
        );
      }
      return `(${params.join(', ')}) => ${printType(type.returnType, ctx)}`;
    }
    case TypeKind.GenericApplication:
      return `${printType(type.type, ctx)}<${type.params
        .map(t => printType(t, ctx))
        .join(', ')}>`;
    case TypeKind.Intersection:
      return type.types.map(t => `${bracketType(t, ctx)}`).join(' & ');
    case TypeKind.Null:
      return 'null';
    case TypeKind.Number:
      return 'number';
    case TypeKind.NumericLiteral:
      return type.value.toString(10);
    case TypeKind.Object: {
      const exact = type.exact && ctx.mode === Mode.flow ? '|' : '';
      return `{${exact}${type.properties
        .map(
          p =>
            `${
              ctx.mode === Mode.typescript
                ? p.variance === Variance.covariant ? 'readonly ' : ''
                : p.variance === Variance.covariant
                  ? '+'
                  : p.variance === Variance.contravariant ? '-' : ''
            }${p.name}${p.optional ? '?' : ''}: ${printType(p.type, ctx)}`,
        )
        .join(', ')}${exact}}`;
    }
    case TypeKind.Reference:
      ctx.read(type.name);
      return type.name;
    case TypeKind.StringLiteral:
      return JSON.stringify(type.value);
    case TypeKind.String:
      return 'string';
    case TypeKind.Tuple:
      return `[${type.types.map(t => `${printType(t, ctx)}`).join(', ')}]`;
    case TypeKind.Union:
      return type.types.map(t => `${bracketType(t, ctx)}`).join(' | ');
    case TypeKind.Void:
      return 'void';
    default:
      return type;
  }
}
export default function printType(type: Type, ctx: Context): string {
  const result = _printType(type, ctx);
  if (typeof result !== 'string') {
    throw new Error('Unsupported type ' + type.kind);
  }
  return result;
}
