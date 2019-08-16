import * as bt from '@babel/types';
import { TypeReference } from '@typeconvert/types';
import { InferScopeContext } from './InferContext';
import { DeeperWaitable } from '../utils/Waitable';
/**
 * Convert a bable type into our internal `TypeReference`
 * representation.
 */
export default function getTypeOfBabelTypeUncached(babelType: bt.FlowType | bt.TSType, ctx: InferScopeContext): DeeperWaitable<TypeReference>;
