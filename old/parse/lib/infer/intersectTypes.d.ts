import { TypeReference, SourceLocation } from '@typeconvert/types';
import { DeeperWaitable, MaybeDeepWaitable } from '../utils/Waitable';
import FileContext from '../FileContext';
export default function intersectTypes(loc: SourceLocation | null, ctx: FileContext, ...typeReferences: MaybeDeepWaitable<TypeReference>[]): DeeperWaitable<TypeReference>;
