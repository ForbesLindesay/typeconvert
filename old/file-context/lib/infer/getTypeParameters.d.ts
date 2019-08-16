import * as bt from '@babel/types';
import { TypeParameter } from '@typeconvert/types';
import { InferScopeContext } from './InferContext';
export default function getTypeParameters(typeParameters: bt.TypeParameterDeclaration | bt.TSTypeParameterDeclaration | bt.Noop | null, ctx: InferScopeContext): TypeParameter[];
