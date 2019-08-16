import { Type } from '@typeconvert/types';
import FileContext from '../FileContext';
import { MaybeDeepWaitable } from '../utils/Waitable';
export declare enum CompareResult {
    AbeforeB = -1,
    AafterB = 1,
    AequalsB = 0
}
export default function compare(a: MaybeDeepWaitable<Type>, b: MaybeDeepWaitable<Type>, ctx: FileContext): CompareResult;
