import {
  Type,
  TypeKind,
  TypeReference,
  TypeReferenceKind,
} from '@typeconvert/types';
import Waitable, {DeeperWaitable} from '../utils/Waitable';

export default function flattenTypes(
  types: DeeperWaitable<TypeReference[]>,
  kind: TypeKind.Union | TypeKind.Intersection,
): DeeperWaitable<TypeReference>[] {
  const result: DeeperWaitable<TypeReference>[] = [];
  for (const typeM of types) {
    const type = Waitable.resolve(typeM);
    if (type.kind === TypeReferenceKind.RawType) {
      const t = Waitable.resolve(type.type);
      if (t.kind === kind) {
        result.push(...flattenTypes(Waitable.resolve(t.types), kind));
      }
    }
    result.push(type);
  }
  return result;
}
