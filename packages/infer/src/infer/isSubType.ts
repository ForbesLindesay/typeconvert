import {Type, TypeKind, TypeParameter, Variance} from '@typeconvert/types';
import FileContext from '../FileContext';
import Waitable, {MaybeDeepWaitable, DeeperWaitable} from '../utils/Waitable';
import resolveTypeReference from './resolveTypeReference';
import {
  ITypeParameterAssignments,
  RootTypeParameterAssignments,
} from './TypeParameterAssignments';

// TODO: this uses all the wrong assignments

/**
 * @return a is sub type of b
 */
export function isSubTypeInner(
  a: MaybeDeepWaitable<Type>,
  aTypeParamAssignments: ITypeParameterAssignments,
  b: MaybeDeepWaitable<Type>,
  bTypeParamAssignments: ITypeParameterAssignments,
  ctx: FileContext,
): boolean {
  if (a === b) {
    return true;
  }
  if (a instanceof Waitable) {
    return isSubTypeInner(
      a.getValue(),
      aTypeParamAssignments,
      b,
      bTypeParamAssignments,
      ctx,
    );
  }
  if (b instanceof Waitable) {
    return isSubTypeInner(
      a,
      aTypeParamAssignments,
      b.getValue(),
      bTypeParamAssignments,
      ctx,
    );
  }
  if (a.kind === TypeKind.Intersection) {
    return Waitable.resolve(a.types).some(t =>
      isSubTypeInner(
        resolveTypeReference(t),
        aTypeParamAssignments,
        b,
        bTypeParamAssignments,
        ctx,
      ),
    );
  }
  if (a.kind === TypeKind.Union) {
    return Waitable.resolve(a.types).every(t =>
      isSubTypeInner(
        resolveTypeReference(t),
        aTypeParamAssignments,
        b,
        bTypeParamAssignments,
        ctx,
      ),
    );
  }
  // if a is a type parameter, add an upper bound
  if (a.kind === TypeKind.TypeParameterReference) {
    // if a is explicilty flexible, continue as normal
    //  e.g. <T>(a: T) => number is sub type of (a: number) => number

    return aTypeParamAssignments
      .getAssignment(Waitable.resolve(a.param))
      .tryAddUpperBound(b, bTypeParamAssignments, ctx);
  }
  // if b is a type parameter, add a lower bound
  if (b.kind === TypeKind.TypeParameterReference) {
    // if b is explicitly flexible, a must be a Type Parameter and
    // is bound to this type parameter e.g.
    // (a: number) => number is not a sub type of <T>(a: number) => T
    return bTypeParamAssignments
      .getAssignment(Waitable.resolve(b.param))
      .tryAddLowerBound(a, aTypeParamAssignments, ctx);
  }
  switch (b.kind) {
    case TypeKind.Any:
      return true;
    case TypeKind.Boolean:
      return a.kind === TypeKind.Boolean || a.kind === TypeKind.BooleanLiteral;
    case TypeKind.BooleanLiteral:
      return (
        a.kind === TypeKind.BooleanLiteral &&
        Waitable.resolve(a.value) === Waitable.resolve(b.value)
      );
    case TypeKind.Function: {
      if (a.kind !== TypeKind.Function) {
        return false;
      }
      const aTypeParameters = Waitable.resolve(a.typeParameters);
      const aChildTypeParams = new TypeParameterAssignments(
        aTypeParameters,
        aTypeParamAssignments,
      );
      const bTypeParameters = Waitable.resolve(b.typeParameters);
      const bChildTypeParams = new TypeParameterAssignments(
        bTypeParameters,
        bTypeParamAssignments,
      );
      const aParams = Waitable.resolve(a.params).map(p => Waitable.resolve(p));
      const bParams = Waitable.resolve(b.params).map(p => Waitable.resolve(p));
      const aRestParam = Waitable.resolve(a.restParam);
      const bRestParam = Waitable.resolve(b.restParam);
      if (
        !aParams.every((aParam, i): boolean => {
          const aIsOptional = () =>
            Waitable.resolve(aParam.optional) ||
            isSubTypeInner(
              {kind: TypeKind.Void, loc: null},
              bChildTypeParams,
              resolveTypeReference(aParam.type),
              aChildTypeParams,
              ctx,
            );
          if (i >= bParams.length) {
            // TODO: what about rest params?
            return aIsOptional();
          }
          const bParam = bParams[i];
          if (Waitable.resolve(bParam.optional) && !aIsOptional()) {
            return false;
          }
          // TODO: add "void" to type list if aParam is optional
          return isSubTypeInner(
            resolveTypeReference(bParam.type),
            bChildTypeParams,
            resolveTypeReference(aParam.type),
            aChildTypeParams,
            ctx,
          );
        })
      ) {
        return false;
      }
      if (aRestParam) {
        // TODO: check any other extra params that b passes
        if (
          bRestParam &&
          !isSubTypeInner(
            resolveTypeReference(bRestParam.type),
            bChildTypeParams,
            resolveTypeReference(aRestParam.type),
            aChildTypeParams,
            ctx,
          )
        ) {
          return false;
        }
      }
      if (
        !isSubTypeInner(
          resolveTypeReference(a.returnType),
          aChildTypeParams,
          resolveTypeReference(b.returnType),
          bChildTypeParams,
          ctx,
        )
      ) {
        return false;
      }
      // TODO: b should not have any new type param constraints
      // i.e. (x: string) => string should not be a sub type of <T>(x: T) => T
      return true;
    }
    case TypeKind.Generic:
      return ctx.assertNever('Not Implemented: ' + b.kind, b);
    case TypeKind.GenericApplication:
      return ctx.assertNever('Not Implemented: ' + b.kind, b);
    case TypeKind.Intersection:
      return Waitable.resolve(b.types).every(t =>
        isSubTypeInner(
          a,
          aTypeParamAssignments,
          resolveTypeReference(t),
          bTypeParamAssignments,
          ctx,
        ),
      );
    case TypeKind.Null:
      return a.kind === TypeKind.Null;
    case TypeKind.Number:
      return a.kind === TypeKind.Number || a.kind === TypeKind.NumericLiteral;
    case TypeKind.NumericLiteral:
      return (
        a.kind === TypeKind.NumericLiteral &&
        Waitable.resolve(a.value) === Waitable.resolve(b.value)
      );
    case TypeKind.Object: {
      if (a.kind !== TypeKind.Object) {
        // TODO: technically you can assign anything to `{}`
        // at least in typescript
        return false;
      }
      const exact = Waitable.resolve(b.exact);
      if (exact && !Waitable.resolve(a.exact)) {
        return false;
      }
      const aProperties = Waitable.resolve(a.properties);
      const bProperties = Waitable.resolve(b.properties);
      if (
        exact &&
        aProperties.some(p => {
          const prop = Waitable.resolve(p);
          const aName = Waitable.resolve(prop.name);
          return !bProperties.some(p => {
            const prop = Waitable.resolve(p);
            const name = Waitable.resolve(prop.name);
            return aName === name;
          });
        })
      ) {
        return false;
      }
      return bProperties.every((bp): boolean => {
        const bProp = Waitable.resolve(bp);
        const bName = Waitable.resolve(bProp.name);
        const ap = aProperties.find(p => {
          const prop = Waitable.resolve(p);
          const aName = Waitable.resolve(prop.name);
          return aName === bName;
        });
        if (!ap) {
          return Waitable.resolve(bProp.optional);
        }
        const aProp = Waitable.resolve(ap);
        if (aProp.optional && !bProp.optional) {
          return false;
        }
        const aVariance = Waitable.resolve(aProp.variance);
        const bVariance = Waitable.resolve(bProp.variance);
        switch (bVariance) {
          case Variance.bivariant:
            // bivariant is actually a nonsense, but the
            // default in typescript. It should be
            // invariant, but actually allows most of
            // the covariant/contravariant stuff
            return (
              aVariance !== Variance.covariant &&
              aVariance !== Variance.contravariant &&
              (isSubTypeInner(
                resolveTypeReference(aProp.type),
                aTypeParamAssignments,
                resolveTypeReference(bProp.type),
                bTypeParamAssignments,
                ctx,
              ) ||
                isSubTypeInner(
                  resolveTypeReference(bProp.type),
                  bTypeParamAssignments,
                  resolveTypeReference(aProp.type),
                  aTypeParamAssignments,
                  ctx,
                ))
            );
          case Variance.contravariant:
            return (
              aVariance !== Variance.covariant &&
              isSubTypeInner(
                resolveTypeReference(bProp.type),
                bTypeParamAssignments,
                resolveTypeReference(aProp.type),
                aTypeParamAssignments,
                ctx,
              )
            );
          case Variance.covariant:
            return (
              aVariance !== Variance.contravariant &&
              isSubTypeInner(
                resolveTypeReference(aProp.type),
                aTypeParamAssignments,
                resolveTypeReference(bProp.type),
                bTypeParamAssignments,
                ctx,
              )
            );
          case Variance.invariant:
            return (
              aVariance !== Variance.covariant &&
              aVariance !== Variance.contravariant &&
              isSubTypeInner(
                resolveTypeReference(aProp.type),
                aTypeParamAssignments,
                resolveTypeReference(bProp.type),
                bTypeParamAssignments,
                ctx,
              ) &&
              isSubTypeInner(
                resolveTypeReference(bProp.type),
                bTypeParamAssignments,
                resolveTypeReference(aProp.type),
                aTypeParamAssignments,
                ctx,
              )
            );
          default:
            return ctx.assertNever('Invalid variance', bVariance);
        }
      });
    }
    case TypeKind.String:
      return a.kind === TypeKind.String || a.kind === TypeKind.StringLiteral;
    case TypeKind.StringLiteral:
      return (
        a.kind === TypeKind.StringLiteral &&
        Waitable.resolve(a.value) === Waitable.resolve(b.value)
      );
    case TypeKind.Tuple: {
      if (a.kind !== TypeKind.Tuple) {
        return false;
      }
      const aTypes = Waitable.resolve(a.types);
      const bTypes = Waitable.resolve(b.types);
      if (aTypes.length !== bTypes.length) {
        return false;
      }
      return aTypes.every((aTypeRef, i) =>
        isSubTypeInner(
          resolveTypeReference(aTypeRef),
          aTypeParamAssignments,
          resolveTypeReference(bTypes[i]),
          bTypeParamAssignments,
          ctx,
        ),
      );
    }
    case TypeKind.Union:
      return Waitable.resolve(b.types).some(t =>
        isSubTypeInner(
          a,
          aTypeParamAssignments,
          resolveTypeReference(t),
          bTypeParamAssignments,
          ctx,
        ),
      );
    case TypeKind.Void:
      return b.kind === TypeKind.Void;
    default:
      return ctx.assertNever('Unsupported type', b);
  }
}
export default function isSubType(
  a: MaybeDeepWaitable<Type>,
  b: MaybeDeepWaitable<Type>,
  ctx: FileContext,
): boolean {
  return isSubTypeInner(
    a,
    RootTypeParameterAssignments,
    b,
    RootTypeParameterAssignments,
    ctx,
  );
}
