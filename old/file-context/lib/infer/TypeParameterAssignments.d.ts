import { MaybeDeepWaitable, DeeperWaitable } from '../utils/Waitable';
import { Type, TypeParameter } from '@typeconvert/types';
import { Set } from 'immutable';
import FileContext from '../FileContext';
export declare enum TypeParameterAssignmentMode {
    ForAll = 0,
    Exists = 1
}
export interface ITypeParameterAssignment {
    readonly upperBounds: Set<{
        type: DeeperWaitable<Type>;
        assignments: ITypeParameterAssignments;
    }>;
    readonly lowerBounds: Set<{
        type: DeeperWaitable<Type>;
        assignments: ITypeParameterAssignments;
    }>;
}
export interface ITypeParameterAssignments {
    trySetLowerBound(tp: MaybeDeepWaitable<TypeParameter>, type: MaybeDeepWaitable<Type>, assignments: ITypeParameterAssignments, ctx: FileContext): boolean;
    trySetUpperBound(tp: MaybeDeepWaitable<TypeParameter>, type: MaybeDeepWaitable<Type>, assignments: ITypeParameterAssignments, ctx: FileContext): boolean;
}
export declare const RootTypeParameterAssignments: ITypeParameterAssignments;
export declare class TypeParameterAssignments implements ITypeParameterAssignments {
    private readonly mode;
    private assignments;
    private readonly parent;
    constructor(mode: TypeParameterAssignmentMode, typeParameters: ReadonlyArray<MaybeDeepWaitable<TypeParameter>>, parent: ITypeParameterAssignments);
    trySetLowerBound(tp: MaybeDeepWaitable<TypeParameter>, type: MaybeDeepWaitable<Type>, assignments: ITypeParameterAssignments, ctx: FileContext): boolean;
    trySetUpperBound(tp: MaybeDeepWaitable<TypeParameter>, type: MaybeDeepWaitable<Type>, assignments: ITypeParameterAssignments, ctx: FileContext): boolean;
}
