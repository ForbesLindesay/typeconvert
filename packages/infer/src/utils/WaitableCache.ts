import * as bt from '@babel/types';
import Waitable, {DeepWaitable, DeeperWaitable} from './Waitable';
import FileContext from '../FileContext';

export default class WaitableCache<TInput, TResult> {
  private _values = new Map<TInput, DeepWaitable<TResult>>();
  getValue(
    input: TInput,
    getValue: () => DeeperWaitable<TResult>,
    loc?: bt.Node['loc'],
    ctx?: FileContext,
  ): DeepWaitable<TResult> {
    const cached = this._values.get(input);
    if (cached) {
      return cached;
    }
    const result = new Waitable(getValue, loc, ctx);
    this._values.set(input, result);
    return result;
  }
}
