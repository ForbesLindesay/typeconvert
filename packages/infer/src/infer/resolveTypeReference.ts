import {TypeReference, Type, TypeReferenceKind} from '@typeconvert/types';
import Waitable, {DeeperWaitable, MaybeDeepWaitable} from '../utils/Waitable';
import {
  ITypeParameterAssignments,
  RootTypeParameterAssignments,
} from './TypeParameterAssignments';

export default function resolveTypeReference(
  typeReference: TypeReference,
  assignments: ITypeParameterAssignments,
): {type: Type; assignments: ITypeParameterAssignments};
export default function resolveTypeReference(
  typeReference: MaybeDeepWaitable<TypeReference>,
  assignments: ITypeParameterAssignments,
): {type: DeeperWaitable<Type>; assignments: ITypeParameterAssignments};
export default function resolveTypeReference(
  typeReference: MaybeDeepWaitable<TypeReference>,
  assignments: ITypeParameterAssignments,
): {type: DeeperWaitable<Type>; assignments: ITypeParameterAssignments} {
  const tr = Waitable.resolve(typeReference);
  switch (tr.kind) {
    case TypeReferenceKind.LocalVariable:
    case TypeReferenceKind.ModuleExport:
      return resolveTypeReference(tr.type, RootTypeParameterAssignments);
    case TypeReferenceKind.RawType:
      return {type: Waitable.resolve(tr.type), assignments};
  }
}
