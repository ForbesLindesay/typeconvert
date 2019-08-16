import * as bt from '@babel/types';
import { Declaration, FunctionParam } from '@typeconvert/types';
import RawDeclaration from '../walk/RawDeclaration';
import { InferScopeContext } from './InferContext';
import { DeeperWaitable } from '../utils/Waitable';
export declare function getParam(param: bt.LVal, ctx: InferScopeContext): DeeperWaitable<FunctionParam>;
export default function getNormalizedDeclarationUncached(declaration: RawDeclaration, ctx: InferScopeContext): DeeperWaitable<Declaration>;
