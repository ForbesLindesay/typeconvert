import {Type, TypeKind, FunctionType} from '@typeconvert/types';

function flatten(types: Type[]) {
  const result: Type[] = [];
  for (const type of types) {
    if (type.kind === TypeKind.Union) {
      result.push(...flatten(type.types));
    } else {
      result.push(type);
    }
  }
  return result;
}
export default function mergeTypes(...types: Type[]): Type {
  types = flatten(types);
  if (types.some(t => t.kind === TypeKind.Any)) {
    return {kind: TypeKind.Any};
  }
  if (types.some(t => t.kind === TypeKind.String)) {
    types = types.filter(t => t.kind !== TypeKind.StringLiteral);
  }
  if (
    types.some(t => t.kind === TypeKind.BooleanLiteral && t.value) &&
    types.some(t => t.kind === TypeKind.BooleanLiteral && !t.value)
  ) {
    types = types
      .filter(t => t.kind !== TypeKind.BooleanLiteral)
      .concat([{kind: TypeKind.Boolean}]);
  }
  if (types.some(t => t.kind === TypeKind.Boolean)) {
    types = types.filter(t => t.kind !== TypeKind.BooleanLiteral);
  }
  types = types
    .slice()
    .sort(compare)
    .filter((value, i, types) => {
      if (i === 0) return true;
      return compare(value, types[i - 1]) !== CompareResult.AequalsB;
    });
  if (types.length === 1) {
    return types[0];
  }
  return {
    kind: TypeKind.Union,
    types,
  };
}
enum CompareResult {
  AbeforeB = -1,
  AafterB = 1,
  AequalsB = 0,
}
function compare(a: Type, b: Type): CompareResult {
  if (a.kind !== b.kind) {
    if (a.kind < b.kind) {
      return CompareResult.AbeforeB;
    } else {
      return CompareResult.AafterB;
    }
  }
  switch (a.kind) {
    case TypeKind.Any:
    case TypeKind.Boolean:
    case TypeKind.Null:
    case TypeKind.Number:
    case TypeKind.String:
    case TypeKind.Void:
      return CompareResult.AequalsB;
    case TypeKind.BooleanLiteral:
      if (a.value && !getB(a, b).value) {
        return CompareResult.AbeforeB;
      }
      if (!a.value && getB(a, b).value) {
        return CompareResult.AafterB;
      }
      return CompareResult.AequalsB;
    case TypeKind.Function:
      if (a.params.length < getB(a, b).params.length) {
        return CompareResult.AbeforeB;
      }
      if (a.params.length > getB(a, b).params.length) {
        return CompareResult.AafterB;
      }
      if (!a.restParam && getB(a, b).restParam) {
        return CompareResult.AbeforeB;
      }
      if (a.restParam && !getB(a, b).restParam) {
        return CompareResult.AafterB;
      }
      if (a.restParam && getB(a, b).restParam) {
        const r = compare(a.restParam.type, getB(a, b).restParam!.type);
        if (r !== CompareResult.AequalsB) {
          return r;
        }
      }
      for (let i = 0; i < a.params.length; i++) {
        const result = compare(a.params[i].type, getB(a, b).params[i].type);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return compare(a.returnType, getB(a, b).returnType);
    case TypeKind.GenericApplication: {
      const arg = compare(a.type, getB(a, b).type);
      if (arg !== CompareResult.AequalsB) {
        return arg;
      }
      if (a.params.length < getB(a, b).params.length) {
        return CompareResult.AbeforeB;
      }
      if (a.params.length > getB(a, b).params.length) {
        return CompareResult.AafterB;
      }
      for (let i = 0; i < a.params.length; i++) {
        const result = compare(a.params[i], getB(a, b).params[i]);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return CompareResult.AequalsB;
    }
    case TypeKind.Union:
    case TypeKind.Intersection: {
      const aTypes = a.types.slice().sort(compare);
      const bTypes = getB(a, b)
        .types.slice()
        .sort(compare);
      if (aTypes.length < bTypes.length) {
        return CompareResult.AbeforeB;
      }
      if (aTypes.length > bTypes.length) {
        return CompareResult.AafterB;
      }
      for (let i = 0; i < aTypes.length; i++) {
        const result = compare(aTypes[i], bTypes[i]);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return CompareResult.AequalsB;
    }
    case TypeKind.Object: {
      if (a.exact && !getB(a, b)) {
        return CompareResult.AbeforeB;
      }
      if (!a.exact && getB(a, b)) {
        return CompareResult.AafterB;
      }
      const aProps = a.properties.sort(
        (a, b) =>
          a.name < b.name ? CompareResult.AbeforeB : CompareResult.AafterB,
      );
      const bProps = getB(a, b)
        .properties.slice()
        .sort(
          (a, b) =>
            a.name < b.name ? CompareResult.AbeforeB : CompareResult.AafterB,
        );
      if (aProps.length < bProps.length) {
        return CompareResult.AbeforeB;
      }
      if (aProps.length > bProps.length) {
        return CompareResult.AafterB;
      }
      for (let i = 0; i < aProps.length; i++) {
        if (aProps[i].name < bProps[i].name) {
          return CompareResult.AbeforeB;
        }
        if (aProps[i].name > bProps[i].name) {
          return CompareResult.AafterB;
        }
        if (aProps[i].variance < bProps[i].variance) {
          return CompareResult.AbeforeB;
        }
        if (aProps[i].variance > bProps[i].variance) {
          return CompareResult.AafterB;
        }
        if (aProps[i].optional && !bProps[i].optional) {
          return CompareResult.AbeforeB;
        }
        if (!aProps[i].optional && bProps[i].optional) {
          return CompareResult.AafterB;
        }

        const result = compare(aProps[i].type, bProps[i].type);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return CompareResult.AequalsB;
    }
    case TypeKind.Reference:
      if (a.name < getB(a, b).name) {
        return CompareResult.AbeforeB;
      }
      if (a.name > getB(a, b).name) {
        return CompareResult.AafterB;
      }
      return CompareResult.AequalsB;
    case TypeKind.StringLiteral:
      if (a.value < getB(a, b).value) {
        return CompareResult.AbeforeB;
      }
      if (a.value > getB(a, b).value) {
        return CompareResult.AafterB;
      }
      return CompareResult.AequalsB;
    case TypeKind.Tuple: {
      // N.B. not sorting becuase order of tuple matters
      const aTypes = a.types;
      const bTypes = getB(a, b).types;
      if (aTypes.length < bTypes.length) {
        return CompareResult.AbeforeB;
      }
      if (aTypes.length > bTypes.length) {
        return CompareResult.AafterB;
      }
      for (let i = 0; i < aTypes.length; i++) {
        const result = compare(aTypes[i], bTypes[i]);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return CompareResult.AequalsB;
    }
    default:
      return a;
  }
}
function getB<T extends Type>(a: T, b: Type): T {
  return b as T;
}
