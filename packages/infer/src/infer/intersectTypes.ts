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

export default function intersectTypes(
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
        // if the other type is assignable to this type, it is redundant
        isSubType(otherType, type, ctx) &&
        // providing it's not the same as the other type
        // if it is the same as the other type, just keep the first instance
        (i > ix || !isSubType(type, otherType, ctx))
      );
    });
    if (!isRedundant) {
      resultingTypes.push(typeReference);
    }
  });
  if (resultingTypes.length === 1) {
    return Waitable.resolve(resultingTypes[0]);
  }

  const intersection: DeeperWaitable<Type> = {
    kind: TypeKind.Intersection,
    types: resultingTypes,
    loc,
  };
  return {
    kind: TypeReferenceKind.RawType,
    type: intersection,
    loc,
  };
}
