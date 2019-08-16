import * as bt from '@babel/types';
import { Type } from '@typeconvert/types';
import { InferScopeContext } from './InferContext';
export default function getTypeOfExpressionUncached(expression: bt.Expression, ctx: InferScopeContext): Type;
