import * as bt from '@babel/types';
import { Type } from '@typeconvert/types';
import Context from './Context';
export default function getTypeOfBabelType(babelType: bt.FlowType | bt.TSType, ctx: Context): Type;
