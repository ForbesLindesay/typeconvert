import * as bt from '@babel/types';
import { TypeParameter, FunctionParam, Type } from '@typeconvert/types';
import Context from './Context';
export interface ExtractedFunction {
    typeParameters: TypeParameter[];
    params: FunctionParam[];
    restParam: FunctionParam | undefined;
    returnType: Type;
}
export default function extractFunction(expression: bt.Function | bt.TSDeclareFunction, ctx: Context): ExtractedFunction;
