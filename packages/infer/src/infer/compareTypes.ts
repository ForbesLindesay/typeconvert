import {Type, TypeKind, FunctionParam, TypeReference} from '@typeconvert/types';
import FileContext from '../FileContext';
import Waitable, {DeeperWaitable, MaybeDeepWaitable} from '../utils/Waitable';
import resolveTypeReference from './resolveTypeReference';

export enum CompareResult {
  AbeforeB = -1,
  AafterB = 1,
  AequalsB = 0,
}
export default function compare(
  a: MaybeDeepWaitable<Type>,
  b: MaybeDeepWaitable<Type>,
  ctx: FileContext,
): CompareResult {
  if (a === b) {
    return CompareResult.AequalsB;
  }
  if (a instanceof Waitable) {
    return compare(a.getValue(), b, ctx);
  }
  if (b instanceof Waitable) {
    return compare(a, b.getValue(), ctx);
  }
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
      return firstDifference(a, b, (a, b) => compareBooleans(a.value, b.value));
    case TypeKind.Function:
      return firstDifference(
        a,
        b,
        (a, b) =>
          // check params same length
          compareStringOrNumber(
            Waitable.resolve(a.params).length,
            Waitable.resolve(b.params).length,
          ),
        (a, b) =>
          // check each parm is the same
          firstDifference(
            a,
            b,
            ...Waitable.resolve(a.params).map((aParam, i) => () =>
              compareFunctionParam(aParam, Waitable.resolve(b.params)[i], ctx),
            ),
          ),
        // check rest params match
        (a, b) => compareFunctionParam(a.restParam, b.restParam, ctx),
        // check return types match
        (a, b) =>
          compare(
            resolveTypeReference(a.returnType),
            resolveTypeReference(b.returnType),
            ctx,
          ),
      );
    case TypeKind.GenericApplication: {
      const arg = compare(a.type, getB(a, b).type, ctx);
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
        const result = compare(a.params[i], getB(a, b).params[i], ctx);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return CompareResult.AequalsB;
    }
    case TypeKind.Union:
    case TypeKind.Intersection: {
      const [aTypes, bTypes] = map(a, b, val => Waitable.resolve(val.types));
      function sortTypes(
        types: ReadonlyArray<MaybeDeepWaitable<TypeReference>>,
      ): Array<MaybeDeepWaitable<Type>> {
        return types
          .map(t => resolveTypeReference(t))
          .sort((a, b) => compare(a, b, ctx));
      }
      return firstDifference(
        a,
        b,
        () => compareStringOrNumber(aTypes.length, bTypes.length),
        () => {
          const aTypesSorted = sortTypes(aTypes);
          const bTypesSorted = sortTypes(bTypes);
          return firstDifference(
            a,
            b,
            ...aTypesSorted.map((a, i) => () =>
              compare(a, bTypesSorted[i], ctx),
            ),
          );
        },
      );
      // const aTypes = a.types.slice().sort((a, b) => compare(a, b, ctx));
      // const bTypes = getB(a, b)
      //   .types.slice()
      //   .sort((a, b) => compare(a, b, ctx));
      // if (aTypes.length < bTypes.length) {
      //   return CompareResult.AbeforeB;
      // }
      // if (aTypes.length > bTypes.length) {
      //   return CompareResult.AafterB;
      // }
      // for (let i = 0; i < aTypes.length; i++) {
      //   const result = compare(aTypes[i], bTypes[i], ctx);
      //   if (result !== CompareResult.AequalsB) {
      //     return result;
      //   }
      // }
      // return CompareResult.AequalsB;
    }
    case TypeKind.NumericLiteral:
      return firstDifference(a, b, (a, b) =>
        compareStringOrNumber(a.value, b.value),
      );
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

        const result = compare(aProps[i].type, bProps[i].type, ctx);
        if (result !== CompareResult.AequalsB) {
          return result;
        }
      }
      return CompareResult.AequalsB;
    }
    case TypeKind.StringLiteral:
      return firstDifference(a, b, (a, b) =>
        compareStringOrNumber(a.value, b.value),
      );
    case TypeKind.Tuple: {
      return firstDifference(
        a,
        b,
        (a, b) =>
          // check tuples are the same length
          compareStringOrNumber(
            Waitable.resolve(a.types).length,
            Waitable.resolve(b.types).length,
          ),
        (a, b) =>
          // check each type in the tuple is the same
          // N.B. not sorting becuase order of tuple matters
          firstDifference(
            a,
            b,
            ...Waitable.resolve(a.types).map((aType, i) => () =>
              compare(
                resolveTypeReference(aType),
                resolveTypeReference(Waitable.resolve(a.types)[i]),
                ctx,
              ),
            ),
          ),
      );
    }
    default:
      return ctx.assertNever('Unable to compare', a);
  }
}

function getB<T extends DeeperWaitable<Type>>(
  a: T,
  b: DeeperWaitable<Type>,
): T {
  if (a.kind !== b.kind) {
    throw new Error('Expected a.kind === b.kind');
  }
  return b as T;
}

function map<T extends DeeperWaitable<Type>, Result>(
  a: T,
  b: DeeperWaitable<Type>,
  map: (value: T) => Result,
): [Result, Result] {
  return [map(a), map(b as T)];
}
function firstDifference<T extends DeeperWaitable<Type>>(
  a: T,
  b: DeeperWaitable<Type>,
  ...comparisons: Array<CompareResult | ((a: T, b: T) => CompareResult)>
): CompareResult {
  if (a.kind !== b.kind) {
    throw new Error('Expected a.kind === b.kind');
  }
  for (let i = 0; i < comparisons.length; i++) {
    const comparison = comparisons[i];
    const result =
      typeof comparison === 'function' ? comparison(a, b as T) : comparison;
    if (result !== CompareResult.AequalsB) {
      return result;
    }
  }
  return CompareResult.AequalsB;
}
function compareBooleans(
  a: MaybeDeepWaitable<boolean>,
  b: MaybeDeepWaitable<boolean>,
): CompareResult {
  const aVal = Waitable.resolve(a);
  const bVal = Waitable.resolve(b);
  if (aVal && !bVal) {
    return CompareResult.AbeforeB;
  }
  if (!aVal && bVal) {
    return CompareResult.AafterB;
  }
  return CompareResult.AequalsB;
}

function compareStringOrNumber<T extends string | number>(
  a: MaybeDeepWaitable<T>,
  b: MaybeDeepWaitable<T>,
): CompareResult {
  const aVal = Waitable.resolve(a);
  const bVal = Waitable.resolve(b);
  if (aVal < bVal) {
    return CompareResult.AbeforeB;
  }
  if (aVal > bVal) {
    return CompareResult.AafterB;
  }
  return CompareResult.AequalsB;
}

function compareFunctionParam<T extends FunctionParam | undefined>(
  a: MaybeDeepWaitable<T>,
  b: MaybeDeepWaitable<T>,
  ctx: FileContext,
): CompareResult {
  const aVal = Waitable.resolve(a);
  const bVal = Waitable.resolve(b);
  if (aVal && !bVal) {
    return CompareResult.AbeforeB;
  }
  if (!aVal && bVal) {
    return CompareResult.AafterB;
  }
  if (!aVal || !bVal) {
    return CompareResult.AequalsB;
  }
  return compare(
    resolveTypeReference(aVal.type),
    resolveTypeReference(bVal.type),
    ctx,
  );
}
