import * as bt from '@babel/types';
import WalkContext from './WalkContext';
import TypeAnnotation from './types/TypeAnnotation';
export default function normalizeTypeAnnotation(typeAnnotation: bt.TypeAnnotation | bt.TSTypeAnnotation, ctx: WalkContext): TypeAnnotation;
export default function normalizeTypeAnnotation(typeAnnotation: bt.TypeAnnotation | bt.TSTypeAnnotation | bt.Noop | null | undefined, ctx: WalkContext): TypeAnnotation | undefined;
export declare function normalizeType(ta: bt.FlowType | bt.TSType, ctx: WalkContext): TypeAnnotation;
export declare function normalizeType(ta: bt.FlowType | bt.TSType | bt.Noop | null | undefined, ctx: WalkContext): TypeAnnotation | undefined;
