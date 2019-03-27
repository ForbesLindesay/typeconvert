import {
  Type,
  TypeKind,
  TypeReference,
  SourceLocation,
  TypeReferenceKind,
} from '@typeconvert/types';
import Waitable, {DeeperWaitable, MaybeDeepWaitable} from '../utils/Waitable';
import FileContext from '../FileContext';
import resolveTypeReference from './resolveTypeReference';
import isSubType from './isSubType';

export default function unionTypes(
  loc: SourceLocation | null,
  ctx: FileContext,
  ...typeReferences: MaybeDeepWaitable<TypeReference>[]
): DeeperWaitable<TypeReference> {
  const resultingTypes: DeeperWaitable<TypeReference[]> = [];

  const types = typeReferences.map(tr => resolveTypeReference(tr));
  typeReferences.forEach((typeReference, i) => {
    const type = types[i];
    const isRedundant = types.some((otherType, ix) => {
      if (ix === i) return false;
      return (
        // if this type is assignable to another type, it is redundant
        isSubType(type, otherType, ctx) &&
        // providing it's not the same as the other type
        // if it is the same as the other type, just keep the first instance
        (i > ix || !isSubType(otherType, type, ctx))
      );
    });
    if (!isRedundant) {
      resultingTypes.push(typeReference);
    }
  });
  if (resultingTypes.length === 1) {
    return Waitable.resolve(resultingTypes[0]);
  }

  const union: DeeperWaitable<Type> = {
    kind: TypeKind.Union,
    types: resultingTypes,
    loc,
  };
  return {
    kind: TypeReferenceKind.RawType,
    type: union,
    loc,
  };
}
