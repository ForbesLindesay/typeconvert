import RawScope from './RawScope';
export default interface RawScopedValue<T> {
    readonly value: T;
    readonly scope: RawScope;
}
