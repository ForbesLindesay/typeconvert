import * as bt from '@babel/types';
import { Declaration, FunctionParam } from '@typeconvert/types';
import RawDeclaration from './RawDeclaration';
import Context from './Context';
export declare function getParam(param: bt.LVal, ctx: Context): FunctionParam;
export default function getNormalizedDeclaration(declaration: RawDeclaration, ctx: Context): Declaration;
