type Fn1<A, Result> = (a: A) => Result;
type Fn2<A, B, Result> = (a: A, b: B) => Result;
type Fn3<A, B, C, Result> = (a: A, b: B, c: C) => Result;

type CurriedFn2<A, B, Result> = Fn1<A, Fn1<B, Result>> & Fn2<A, B, Result>;
type CurriedFn3<A, B, C, Result> = Fn1<A, CurriedFn2<B, C, Result>> &
  Fn2<A, B, Fn1<C, Result>> &
  Fn3<A, B, C, Result>;

function curried(f: any, length: any, acc: any): any {
  return function fn(this: any) {
    // eslint-disable-next-line prefer-rest-params
    const combined = acc.concat(Array.prototype.slice.call(arguments));
    return combined.length >= length
      ? f.apply(this, combined)
      : curried(f, length, combined);
  };
}

export default function curry<A, B, C>(f: Fn2<A, B, C>): CurriedFn2<A, B, C>;
export default function curry<A, B, C, D>(
  f: Fn3<A, B, C, D>,
): CurriedFn3<A, B, C, D>;
export default function curry(f: Function) {
  // eslint-disable-line no-redeclare
  return curried(f, f.length, []);
}
export const add = curry((a: number, b: number): number => a + b);

export const x = add(1)(2);
export const y = add(1, 2);
