import { Type } from '@typeconvert/types';
import FileContext from '../FileContext';
import { MaybeDeepWaitable } from '../utils/Waitable';
import { ITypeParameterAssignments } from './TypeParameterAssignments';
/**
 * @return a is sub type of b
 */
export declare function isSubTypeInner(a: MaybeDeepWaitable<Type>, aTypeParamAssignments: ITypeParameterAssignments, b: MaybeDeepWaitable<Type>, bTypeParamAssignments: ITypeParameterAssignments, ctx: FileContext): boolean;
export default function isSubType(a: MaybeDeepWaitable<Type>, b: MaybeDeepWaitable<Type>, ctx: FileContext): boolean;
