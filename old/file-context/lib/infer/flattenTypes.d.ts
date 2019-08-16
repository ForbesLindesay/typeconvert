import { TypeKind, TypeReference } from '@typeconvert/types';
import { DeeperWaitable } from '../utils/Waitable';
export default function flattenTypes(types: DeeperWaitable<TypeReference[]>, kind: TypeKind.Union | TypeKind.Intersection): DeeperWaitable<TypeReference>[];
