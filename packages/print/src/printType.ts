import {Mode, Type, TypeKind, Variance} from '@typeconvert/types';
import Context from './Context';

function _printType(type: Type, ctx: Context): string {
  switch (type.kind) {
    case TypeKind.Any:
      return 'any';
    case TypeKind.Number:
      return 'number';
    case TypeKind.Object:
      return `{${type.properties
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
        .join(', ')}}`;
    case TypeKind.Reference:
      ctx.read(type.name);
      return type.name;
    case TypeKind.String:
      return 'string';
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
