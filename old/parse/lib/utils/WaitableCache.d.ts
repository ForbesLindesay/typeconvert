import * as bt from '@babel/types';
import { DeepWaitable, DeeperWaitable } from './Waitable';
import FileContext from '../FileContext';
export default class WaitableCache<TInput, TResult> {
    private _values;
    getValue(input: TInput, getValue: () => DeeperWaitable<TResult>, loc?: bt.Node['loc'], ctx?: FileContext): DeepWaitable<TResult>;
}
