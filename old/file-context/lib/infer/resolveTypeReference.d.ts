import { TypeReference, Type } from '@typeconvert/types';
import { DeeperWaitable, MaybeDeepWaitable } from '../utils/Waitable';
import { ITypeParameterAssignments } from './TypeParameterAssignments';
export default function resolveTypeReference(typeReference: TypeReference, assignments: ITypeParameterAssignments): {
    type: Type;
    assignments: ITypeParameterAssignments;
};
export default function resolveTypeReference(typeReference: MaybeDeepWaitable<TypeReference>, assignments: ITypeParameterAssignments): {
    type: DeeperWaitable<Type>;
    assignments: ITypeParameterAssignments;
};
