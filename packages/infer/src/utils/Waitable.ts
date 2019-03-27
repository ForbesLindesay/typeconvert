import * as bt from '@babel/types';
import FileContext from '../FileContext';
const {codeFrameColumns} = require('@babel/code-frame');

export type DeeperWaitable<T> =
    T extends any[] ? DeepWaitableArray<T[number]> :
    T extends ReadonlyArray<any> ? ReadonlyDeepWaitableArray<T[number]> :
    T extends object ? DeepWaitableObject<T> :
    T;

export interface DeepWaitableArray<T> extends Array<MaybeDeepWaitable<T>> {}
export interface ReadonlyDeepWaitableArray<T> extends ReadonlyArray<MaybeDeepWaitable<T>> {}

export type DeepWaitableObject<T> = {
    [P in keyof T]: P extends 'kind' | 'loc' ? T[P] : MaybeDeepWaitable<T[P]>;
};

export type UnWaitable<T> = 
  T extends Waitable<infer R> ? DeepUnwaitable<R>
  : DeepUnwaitable<T>;
export type DeepUnwaitable<T> =
    T extends any[] ? UnWaitableArray<T[number]> :
    T extends ReadonlyArray<any> ? UnWaitableReadonlyArray<T[number]> :
    T extends object ? UnWaitableObject<T> :
    T;
export interface UnWaitableArray<T> extends Array<UnWaitable<T>> {}
export interface UnWaitableReadonlyArray<T> extends ReadonlyArray<UnWaitable<T>> {}
export type UnWaitableObject<T> = {
  [P in keyof T]: UnWaitable<T[P]>;
}

enum Status {
  Pending,
  Fulfilled,
  Rejected,
}
type State<T> = 
  | {status: Status.Pending}
  | {status: Status.Fulfilled, value: T}
  | {status: Status.Rejected, error: any};

export type MaybeDeepWaitable<T> = DeeperWaitable<T> | Waitable<DeeperWaitable<T>>;
export type DeepWaitable<T> = Waitable<DeeperWaitable<T>>;

class Waitable<T> {
  private readonly _loc: bt.Node['loc'] | undefined;
  private readonly _ctx: FileContext | undefined;
  private _getValue: (() => T) | undefined;
  private _state: State<T> = {status: Status.Pending};
  constructor(getValue: () => T, loc?: bt.Node['loc'], ctx?: FileContext) {
    this._getValue = getValue;
    this._loc = loc;
    this._ctx = ctx;
  }
  getValue(): T {
    switch (this._state.status) {
      case Status.Pending:
        try {
          const getValue = this._getValue;
          this._getValue = undefined;
          if (!getValue) {
            const err = new Error('Unable to resolve cyclic dependency');
            (err as any)._waitableCycle = [];
            throw err;
          }
          const value = getValue();
          this._state = {status: Status.Fulfilled, value};
          return value;
        } catch (error) {
          const waitableCycle: Waitable<any>[] | undefined = (error as any)._waitableCycle;
          if (waitableCycle) {
            if (waitableCycle.indexOf(this) !== -1) {
              (error as any)._waitableCycle = undefined;
            } else {
              waitableCycle.push(this);
              if (this._loc && this._ctx) {
                error.message += '\n\n' + codeFrameColumns(this._ctx.src, this._loc, {
                  highlightCode: Waitable.highlightCodeInErrors,
                });
              }
            }
          }
          this._state = {status: Status.Rejected, error};
          throw error;
        }
      case Status.Fulfilled:
        return this._state.value;
      case Status.Rejected:
        throw this._state.error;
    }
  }
  getValueDeep(): UnWaitable<T> {
    return Waitable.resolveDeep(this.getValue());
  }
  then<S>(fn: (value: T) => Waitable<S> | S): Waitable<S> {
    return new Waitable((): S => {
      const result = fn(this.getValue());
      if (result instanceof Waitable) {
        return result.getValue();
      } else {
        return result;
      }
    });
  }
  thenDeep<S>(fn: (value: UnWaitable<T>) => Waitable<S> | S): Waitable<S> {
    return new Waitable((): S => {
      const result = fn(this.getValueDeep());
      if (result instanceof Waitable) {
        return result.getValue();
      } else {
        return result;
      }
    });
  }

  static highlightCodeInErrors: boolean = true;
  static resolve<T>(value: Waitable<T> | T): T {
    if (value instanceof Waitable) {
      return value.getValue();
    } else {
      return value;
    }
  }
  static resolveDeep<T>(value: T): UnWaitable<T> {
    // the slightly odd data structure is to be able to handle recursive structures:
    // e.g.
    // const x = new Waitable(() => 10);
    // const y = {x};
    // y.y = y;
    // const z = new Waitable(() => y);
    // Waitable.resolveDeep(z);
    const cache = new Map<any, {completed: true, value: any} | {completed: false, pending: Array<(value: any) => any>}>();
    function recurse(value: any, onResult: (value: any) => void) {
      const cached = cache.get(value);
      if (cached) {
        if (cached.completed) {
          onResult(cached.value);
        } else {
          cached.pending.push(onResult);
        }
        return;
      }
      const pending = [onResult];
      cache.set(value, {completed: false, pending});
      onResult = (result) => {
        cache.set(value, {completed: true, value: result});
        pending.forEach(p => p(result));
      };
      if (value instanceof Waitable) {
        recurse(value.getValue(), onResult);
        return;
      }
      if (Array.isArray(value)) {
        const result: any[] = new Array(value.length);
        value.forEach((value, i) => {
          recurse(value, value => result[i] = value);
        })
        onResult(result);
        return;
      }
      if (value && typeof value === 'object') {
        const result: any = {};
        for (const key in value) {
          recurse(value[key], value => result[key] = value);
        }
        onResult(result);
        return;
      }
      onResult(value);
    }
    let result: any;
    recurse(value, v => result = v);
    return result;
  }
}
export default Waitable;