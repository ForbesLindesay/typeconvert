import Waitable, {MaybeDeepWaitable, DeeperWaitable} from '../utils/Waitable';
import {Type, TypeParameter} from '@typeconvert/types';
import {Map, Set} from 'immutable';
import resolveTypeReference from './resolveTypeReference';
import FileContext from '../FileContext';
import {isSubTypeInner} from './isSubType';

// "<T>x is a subclass of <S>y" means forall S there exists a T such that "<T>x is a subclass of <S>y"
// this is at the point where the "Generic" type occurs
export enum TypeParameterAssignmentMode {
  ForAll,
  Exists,
}

// TODO: exact assignments:
//
// type Value<T> = {x: T};
// export default declare var v: Value<number>;
//
// should output
//
// export default declare var v: {x: number};

// is () => number a subclass of <T>() => T
// this is: for all T, is () => number a subclass of () => T
// is number a subclass of T
// in this instance, we're not allowed to add a lower bound of number to T
// No!

// is (x: number) => void a subclass of <T>(x: T) => void
// this is: for all T, is (x: number) => void a subclass of (x: T) => void
// is T a subclass of number
// in this instance, we're not allowed to add an upper bound to T
// No!

// is (x: number) => void a subclass of <T: number>(x: T) => void
// this is: for all T: number, is (x: number) => void a subclass of (x: T) => void
// is <T: number>T a subclass of number
// we don't need to add an upper bound to T as it already has one
// Yes!

// is <T>(x: T) => T a subclass of (x: number) => number
// this is: exists T, such that (x: T) => T a subclass of (x: number) => number
// is number a subclass of T
// in this instance, we are allowed to add a lower bound of number to T
// is T a subclass of number
// in this instance, we are allowed to add an upper bound of number to T
// Yes!

// each `TypeParameterAssignments` instance can be in `forall` mode or `exists` mode
// in `forall` mode, upper bounds are allowed if T already has the upper bound e.g. (x: number) => void is a subclass of <T: 1 | 2>(x: T) => void
//                   lower bounds are allowed if T already has the lower bound e.g. () => 1 is a subclass of <number: T>() => T
// in `exists` mode, upper bounds can be added e.g. <T>() => T is a subclass of () => number
//                   lower bounds can be added e.g <T>(x: T) => void is a subclass of (x: number) =>void
//                   adding both allows <T>(x: T) => T is a subclass of (x: 1 | 2 | 3) => number
//                   adding both still ensures <T>(x: T) => T is not a subclass of (x: number) => string

// adding both allows <T>(x: T) => T is a subclass of <S>(x: S) => S because we always prioritise the "exists" over the forall, meaning we say:
//   for the parameter: yes, S can be a subclass of T because we can add a lower bound on T of S
//   for the result we say: yes, T can be a subclass of S becuase we can add an upper bound on T of S

// TODO: remove type parameters from `Function` type, we'll just use the `Generic` type for consistency

export interface ITypeParameterAssignment {
  readonly upperBounds: Set<{
    type: DeeperWaitable<Type>;
    assignments: ITypeParameterAssignments;
  }>;
  readonly lowerBounds: Set<{
    type: DeeperWaitable<Type>;
    assignments: ITypeParameterAssignments;
  }>;
}
export interface ITypeParameterAssignments {
  // i.e. number extends T
  trySetLowerBound(
    tp: MaybeDeepWaitable<TypeParameter>,
    type: MaybeDeepWaitable<Type>,
    assignments: ITypeParameterAssignments,
    ctx: FileContext,
  ): boolean;
  // i.e. T extends number
  trySetUpperBound(
    tp: MaybeDeepWaitable<TypeParameter>,
    type: MaybeDeepWaitable<Type>,
    assignments: ITypeParameterAssignments,
    ctx: FileContext,
  ): boolean;
}
function typeParameterNotFound(
  tp: MaybeDeepWaitable<TypeParameter>,
  type: MaybeDeepWaitable<Type>,
  assignments: ITypeParameterAssignments,
  ctx: FileContext,
): boolean {
  throw ctx.getError(
    'Could not find type parameter ' +
      Waitable.resolve(Waitable.resolve(tp).name),
    Waitable.resolve(tp),
  );
}
export const RootTypeParameterAssignments: ITypeParameterAssignments = {
  trySetLowerBound: typeParameterNotFound,
  trySetUpperBound: typeParameterNotFound,
};
export class TypeParameterAssignments implements ITypeParameterAssignments {
  private readonly mode: TypeParameterAssignmentMode;
  private assignments = Map<
    DeeperWaitable<TypeParameter>,
    ITypeParameterAssignment
  >();
  private readonly parent: ITypeParameterAssignments;
  constructor(
    mode: TypeParameterAssignmentMode,
    typeParameters: ReadonlyArray<MaybeDeepWaitable<TypeParameter>>,
    parent: ITypeParameterAssignments,
  ) {
    this.mode = mode;
    if (typeParameters) {
      typeParameters.map(tp => Waitable.resolve(tp)).forEach(tp => {
        const extendsType = Waitable.resolve(tp.extends);
        this.assignments.set(tp, {
          upperBounds: extendsType
            ? Set([resolveTypeReference(extendsType, parent)])
            : Set(),
          lowerBounds: Set(),
        });
      });
    }
    this.parent = parent;
  }
  // i.e. number extends T
  trySetLowerBound(
    tp: MaybeDeepWaitable<TypeParameter>,
    type: MaybeDeepWaitable<Type>,
    assignments: ITypeParameterAssignments,
    ctx: FileContext,
  ): boolean {
    const typeParam = Waitable.resolve(tp);
    const t = Waitable.resolve(type);
    const current = this.assignments.get(typeParam);
    if (!current) {
      return this.parent.trySetLowerBound(tp, type, assignments, ctx);
    }
    switch (this.mode) {
      case TypeParameterAssignmentMode.Exists:
        if (
          // allowed if sub type of all the upper bounds
          current.upperBounds.every(ub =>
            isSubTypeInner(t, assignments, ub!.type, ub!.assignments, ctx),
          )
        ) {
          this.assignments = this.assignments.set(typeParam, {
            upperBounds: current.upperBounds,
            lowerBounds: current.lowerBounds.add({type: t, assignments}),
          });
          return true;
        }
        return false;
      case TypeParameterAssignmentMode.ForAll:
        // allowed if there is already a lower bound that includes more types
        // i.e. asserting 1 extends T is not necessary after asserting number extends T
        // becuase 1 is a sub type of all numbers
        if (
          current.lowerBounds.some(lb =>
            isSubTypeInner(t, assignments, lb!.type, lb!.assignments, ctx),
          )
        ) {
          return true;
        }
        return false;
      default:
        return ctx.assertNever('Unsupported mode', this.mode);
    }
  }
  // i.e. T extends number
  trySetUpperBound(
    tp: MaybeDeepWaitable<TypeParameter>,
    type: MaybeDeepWaitable<Type>,
    assignments: ITypeParameterAssignments,
    ctx: FileContext,
  ): boolean {
    const typeParam = Waitable.resolve(tp);
    const t = Waitable.resolve(type);
    const current = this.assignments.get(typeParam);
    if (!current) {
      return this.parent.trySetLowerBound(tp, type, assignments, ctx);
    }
    switch (this.mode) {
      case TypeParameterAssignmentMode.Exists:
        if (
          // allowed if super type of all the lower bounds
          current.lowerBounds.every(lb =>
            isSubTypeInner(lb!.type, lb!.assignments, type, assignments, ctx),
          )
        ) {
          this.assignments = this.assignments.set(typeParam, {
            upperBounds: current.upperBounds.add({type: t, assignments}),
            lowerBounds: current.lowerBounds,
          });
          return true;
        }
        return false;
      case TypeParameterAssignmentMode.ForAll:
        // allowed if there is already an upper bound that includes fewer types
        // i.e. asserting T extends number is not necessary after asserting T extends 1
        // becuase 1 is a sub type of all numbers
        if (
          // there exists an upper bound (e.g. `1`)
          // such that ub is sub type of type
          // e.g. 1 is sub type of number
          current.upperBounds.some(ub =>
            isSubTypeInner(ub!.type, ub!.assignments, t, assignments, ctx),
          )
        ) {
          return true;
        }
        return false;
      default:
        return ctx.assertNever('Unsupported mode', this.mode);
    }
  }
}
