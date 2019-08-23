type Curried<A extends any[], B extends any[], R> = A extends []
  ? (...b: B) => R
  : (...a: A) => VariadicCurry<B, R>;

type Curry1<A, R> = Curried<[], [A], R>;

type Curry2<A, B, R> = Curried<[], [A, B], R> & Curried<[A], [B], R>;

type Curry3<A, B, C, R> = Curried<[], [A, B, C], R> &
  Curried<[A], [B, C], R> &
  Curried<[A, B], [C], R>;

type Curry4<A, B, C, D, R> = Curried<[], [A, B, C, D], R> &
  Curried<[A], [B, C, D], R> &
  Curried<[A, B], [C, D], R> &
  Curried<[A, B, C], [D], R>;

type Curry5<A, B, C, D, E, R> = Curried<[], [A, B, C, D, E], R> &
  Curried<[A], [B, C, D, E], R> &
  Curried<[A, B], [C, D, E], R> &
  Curried<[A, B, C], [D, E], R> &
  Curried<[A, B, C, D], [E], R>;

type VariadicCurry<T, R> = T extends [any, any, any, any, any]
  ? Curry5<T[0], T[1], T[2], T[3], T[4], R>
  : T extends [any, any, any, any]
  ? Curry4<T[0], T[1], T[2], T[3], R>
  : T extends [any, any, any]
  ? Curry3<T[0], T[1], T[2], R>
  : T extends [any, any]
  ? Curry2<T[0], T[1], R>
  : T extends [any]
  ? Curry1<T[0], R>
  : unknown;

declare function curry<T extends any[], R>(
  fn: (...args: T) => R,
): VariadicCurry<T, R>;
export default curry;

export const add = curry(
  (a: number, b: number, c: number, d: number, e: number): number =>
    a + b + c + d + e,
);

export const a1: number = add(1)(2)(3)(4)(5);
export const a2: number = add(1)(2)(3)(4, 5);
export const a3: number = add(1)(2)(3, 4)(5);
export const a4: number = add(1)(2)(3, 4, 5);
export const a5: number = add(1)(2, 3)(4)(5);
export const a6: number = add(1)(2, 3)(4, 5);
export const a7: number = add(1)(2, 3, 4)(5);
export const a8: number = add(1)(2, 3, 4, 5);
export const b1: number = add(1, 2)(3)(4)(5);
export const b2: number = add(1, 2)(3)(4, 5);
export const b3: number = add(1, 2)(3, 4)(5);
export const b4: number = add(1, 2)(3, 4, 5);
export const c1: number = add(1, 2, 3)(4)(5);
export const c2: number = add(1, 2, 3)(4, 5);
export const e: number = add(1, 2, 3, 4)(5);
export const f: number = add(1, 2, 3, 4, 5);
