import * as bt from '@babel/types';
import FileContext from '../FileContext';
export declare type DeeperWaitable<T> = T extends any[] ? DeepWaitableArray<T[number]> : T extends ReadonlyArray<any> ? ReadonlyDeepWaitableArray<T[number]> : T extends object ? DeepWaitableObject<T> : T;
export interface DeepWaitableArray<T> extends Array<MaybeDeepWaitable<T>> {
}
export interface ReadonlyDeepWaitableArray<T> extends ReadonlyArray<MaybeDeepWaitable<T>> {
}
export declare type DeepWaitableObject<T> = {
    [P in keyof T]: P extends 'kind' | 'loc' ? T[P] : MaybeDeepWaitable<T[P]>;
};
export declare type UnWaitable<T> = T extends Waitable<infer R> ? DeepUnwaitable<R> : DeepUnwaitable<T>;
export declare type DeepUnwaitable<T> = T extends any[] ? UnWaitableArray<T[number]> : T extends ReadonlyArray<any> ? UnWaitableReadonlyArray<T[number]> : T extends object ? UnWaitableObject<T> : T;
export interface UnWaitableArray<T> extends Array<UnWaitable<T>> {
}
export interface UnWaitableReadonlyArray<T> extends ReadonlyArray<UnWaitable<T>> {
}
export declare type UnWaitableObject<T> = {
    [P in keyof T]: UnWaitable<T[P]>;
};
export declare type MaybeDeepWaitable<T> = DeeperWaitable<T> | Waitable<DeeperWaitable<T>>;
export declare type DeepWaitable<T> = Waitable<DeeperWaitable<T>>;
declare class Waitable<T> {
    private readonly _loc;
    private readonly _ctx;
    private _getValue;
    private _state;
    constructor(getValue: () => T, loc?: bt.Node['loc'], ctx?: FileContext);
    getValue(): T;
    getValueDeep(): UnWaitable<T>;
    then<S>(fn: (value: T) => Waitable<S> | S): Waitable<S>;
    thenDeep<S>(fn: (value: UnWaitable<T>) => Waitable<S> | S): Waitable<S>;
    static highlightCodeInErrors: boolean;
    static resolve<T>(value: Waitable<T> | T): T;
    static resolveDeep<T>(value: T): UnWaitable<T>;
}
export default Waitable;
